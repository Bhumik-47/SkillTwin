'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  DomainId,
  DomainMeta,
  LearningStyle,
  ExperienceLevel,
  Skill,
  SkillDependency,
  LearningPath,
  LearningPathNode,
  PathRepairDiff,
  LearnerProfile,
  Recommendation,
  AssessmentQuestion
} from '../types';
import { bktStep } from '../engine/bkt';
import { validateAndToposort, evaluateNodeStatus } from '../engine/planner';
import { SkillTwinAPI } from '../api';

import beGraph from '../../data/domains/backend_engineering.json';
import pyGraph from '../../data/domains/python_fundamentals.json';
import webGraph from '../../data/domains/web_basics.json';
import daGraph from '../../data/domains/data_analysis.json';

const DOMAIN_DATA: Record<DomainId, { skills: Skill[]; dependencies: SkillDependency[] }> = {
  backend_engineering: beGraph as any,
  python_fundamentals: pyGraph as any,
  web_basics: webGraph as any,
  data_analysis: daGraph as any
};

class HybridMasteryMap extends Map<string, number> {
  [key: string]: any;
  constructor(entries?: [string, number][]) {
    super(entries);
    if (entries) {
      for (const [k, v] of entries) {
        this[k] = v;
      }
    }
  }

  set(key: string, value: number): this {
    super.set(key, value);
    this[key] = value;
    return this;
  }
}

interface SkillTwinContextType {
  user: { id: string; full_name: string; email: string; profile: LearnerProfile };
  profile: LearnerProfile;
  updateProfile: (updates: Partial<LearnerProfile>) => void;
  skills: Skill[];
  dependencies: SkillDependency[];
  masteryMap: HybridMasteryMap;
  setMasteryMap: React.Dispatch<React.SetStateAction<HybridMasteryMap>>;
  selfReportedMap: HybridMasteryMap;
  attemptsHistory: any[];
  activeTab: string;
  setActiveTab: (tab: any) => void;
  currentDomain: DomainId;
  domainsList: DomainMeta[];
  switchDomain: (domain: DomainId) => void;
  resetDomainState: () => void;
  currentPath: LearningPath | null;
  activeRepairDiff: any | null;
  dismissDiffCard: () => void;
  selectedSkillId: string | null;
  setSelectedSkillId: (id: string | null) => void;
  isAssessmentOpen: boolean;
  setIsAssessmentOpen: (open: boolean) => void;
  assessmentSkillId: string | null;
  openAssessment: (skillId?: string) => void;
  closeAssessment: () => void;
  isBktModalOpen: boolean;
  openBktModal: () => void;
  closeBktModal: () => void;
  latestBktResult: any | null;
  isAIChatOpen: boolean;
  setIsAIChatOpen: (open: boolean) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  showLandingPage: boolean;
  setShowLandingPage: (show: boolean) => void;
  token: string | null;
  isAuthenticated: boolean;
  loginUser: (payloadOrEmail: any, maybePassword?: string) => Promise<boolean>;
  signupUser: (payloadOrEmail: any, maybePassword?: string, maybeName?: string) => Promise<boolean>;
  logoutUser: () => void;
  backendOnline: boolean;
  isLoading: boolean;
  recommendations: Recommendation[];
  submitQuizResult: (skillId: string, isCorrect: boolean, score: number) => Promise<void>;
  submitAssessmentEvidence: (skillId: string, score: number, durationSeconds?: number, answers?: any) => Promise<any>;
  triggerRepair: (triggerSkillId: string, forceRemedial?: boolean) => Promise<void>;
}

const SkillTwinContext = createContext<SkillTwinContextType | undefined>(undefined);

export function SkillTwinProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTabRaw] = useState<string>('dashboard');
  const [showLandingPage, setShowLandingPage] = useState<boolean>(true);
  const [currentDomain, setCurrentDomain] = useState<DomainId>('backend_engineering');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auth State
  const [token, setToken] = useState<string | null>('demo-jwt-token-active');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Modal states
  const [isAssessmentOpen, setIsAssessmentOpen] = useState<boolean>(false);
  const [assessmentSkillId, setAssessmentSkillId] = useState<string | null>(null);
  const [isBktModalOpen, setIsBktModalOpen] = useState<boolean>(false);
  const [latestBktResult, setLatestBktResult] = useState<any | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  // Profile state
  const [profile, setProfile] = useState<LearnerProfile>({
    user_id: 'usr_demo_01',
    full_name: 'Alex',
    target_role: 'Senior Backend Engineer',
    weekly_hours_budget: 12,
    preferred_learning_style: 'hands_on',
    prior_experience_level: 'beginner'
  });

  const [userEmail, setUserEmail] = useState<string>('123@gmail.com');

  const user = useMemo(() => ({
    id: profile.user_id || 'usr_demo_01',
    full_name: profile.full_name || 'Alex',
    email: userEmail || '123@gmail.com',
    profile
  }), [profile, userEmail]);

  const [masteryMap, setMasteryMap] = useState<HybridMasteryMap>(new HybridMasteryMap());
  const [selfReportedMap, setSelfReportedMap] = useState<HybridMasteryMap>(new HybridMasteryMap());
  const [attemptsHistory, setAttemptsHistory] = useState<any[]>([]);

  const [currentPath, setCurrentPath] = useState<LearningPath | null>(null);
  const [activeRepairDiff, setActiveRepairDiff] = useState<any | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const domainData = useMemo(() => DOMAIN_DATA[currentDomain] || DOMAIN_DATA.backend_engineering, [currentDomain]);
  const skills = domainData.skills;
  const dependencies = domainData.dependencies;

  const domainsList: DomainMeta[] = useMemo(() => [
    {
      id: 'backend_engineering',
      name: 'Backend Engineering',
      label: 'Backend Engineering',
      description: 'Distributed systems, FastAPI, SQL indexing, Docker, Kafka',
      badge: '46 Nodes',
      nodeCount: 46,
      color: 'emerald',
      iconName: 'Database'
    },
    {
      id: 'python_fundamentals',
      name: 'Python Fundamentals',
      label: 'Python Fundamentals',
      description: 'Variables, OOP, generators, closures, pytest, async',
      badge: '18 Nodes',
      nodeCount: 18,
      color: 'sky',
      iconName: 'Code2'
    },
    {
      id: 'web_basics',
      name: 'Web Basics',
      label: 'Web Basics (HTML/CSS/JS)',
      description: 'HTML5 semantic structure, CSS Grid/Flexbox, DOM, REST Fetch',
      badge: '16 Nodes',
      nodeCount: 16,
      color: 'amber',
      iconName: 'Globe'
    },
    {
      id: 'data_analysis',
      name: 'Data Analysis',
      label: 'Data Analysis (Pandas & NumPy)',
      description: 'NumPy vectors, DataFrame indexing, GroupBy aggregation, EDA',
      badge: '16 Nodes',
      nodeCount: 16,
      color: 'purple',
      iconName: 'BarChart3'
    }
  ], []);

  const setActiveTab = (tab: any) => {
    if (tab === 'repair_studio') {
      setActiveTabRaw('repair');
    } else {
      setActiveTabRaw(tab);
    }
  };

  // Check Backend Status
  useEffect(() => {
    SkillTwinAPI.getHealth().then(online => setBackendOnline(online));
  }, []);

  const initDomainPath = useCallback((domainKey: DomainId) => {
    setIsLoading(true);
    const data = DOMAIN_DATA[domainKey] || DOMAIN_DATA.backend_engineering;
    const { skills: curSkills, dependencies: curDeps } = data;
    const { sorted: sortedSkillIds } = validateAndToposort(curSkills, curDeps);
    const skillsById = new Map(curSkills.map(s => [s.id, s]));

    // Check if the authenticated user has saved mastery for this domain
    let savedMasteryMap: Record<string, number> = {};
    if (typeof window !== 'undefined' && profile.user_id) {
      try {
        const raw = localStorage.getItem(`skilltwin_mastery_${profile.user_id}_${domainKey}`);
        if (raw) {
          savedMasteryMap = JSON.parse(raw);
        }
      } catch {}
    }

    const initialEntries: [string, number][] = sortedSkillIds.map(sId => [
      sId,
      savedMasteryMap[sId] !== undefined ? savedMasteryMap[sId] : 0.10
    ]);
    const selfEntries: [string, number][] = sortedSkillIds.map(sId => [
      sId,
      savedMasteryMap[sId] !== undefined ? savedMasteryMap[sId] : 0.10
    ]);

    const newMastery = new HybridMasteryMap(initialEntries);
    setMasteryMap(newMastery);
    setSelfReportedMap(new HybridMasteryMap(selfEntries));

    const nodes: LearningPathNode[] = sortedSkillIds.map((sId, idx) => {
      const skill = skillsById.get(sId)!;
      const prereqs = curDeps
        .filter(d => d.target_skill_id === sId)
        .map(d => d.source_skill_id);

      const masteryProb = newMastery.get(sId) || 0.10;
      const status = evaluateNodeStatus(sId, masteryProb, prereqs, newMastery);

      return {
        node_id: `node_${sId}`,
        step_order: idx + 1,
        skill_id: sId,
        skill_name: skill.name,
        recommended_resource_id: skill.resource_ids?.[0] || `res_${sId}_01`,
        status,
        mastery_prob: masteryProb,
        prerequisite_skill_ids: prereqs,
        estimated_minutes: skill.estimated_duration_minutes || 45
      };
    });

    const totalMinutes = nodes.reduce((acc, n) => acc + n.estimated_minutes, 0);

    const path: LearningPath = {
      id: `path_${domainKey}_v1`,
      user_id: profile.user_id || 'usr_demo_01',
      goal_id: `goal_${domainKey}`,
      version: 1,
      nodes,
      total_estimated_minutes: totalMinutes,
      status: 'active',
      explanation: `Curated an optimal ${nodes.length}-step topological roadmap for '${profile.target_role}' in ${domainKey.replace('_', ' ')}.`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setCurrentPath(path);
    setActiveRepairDiff(null);
    setIsLoading(false);
  }, [profile.target_role, profile.user_id]);

  useEffect(() => {
    initDomainPath(currentDomain);
  }, [currentDomain, initDomainPath]);

  const switchDomain = (domain: DomainId) => {
    setCurrentDomain(domain);
  };

  // Hydrate user session from localStorage and backend DB on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedToken = localStorage.getItem('skilltwin_session_token');
      const savedUserStr = localStorage.getItem('skilltwin_session_user');

      if (savedToken && savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        setToken(savedToken);
        setIsAuthenticated(true);
        setShowLandingPage(false);
        setUserEmail(savedUser.email || '');

        if (savedUser.profile) {
          setProfile({
            user_id: savedUser.id,
            full_name: savedUser.full_name || 'Learner',
            target_role: savedUser.profile.target_role || 'Senior Backend Engineer',
            weekly_hours_budget: savedUser.profile.weekly_hours_budget || 12,
            preferred_learning_style: savedUser.profile.preferred_learning_style || 'hands_on',
            prior_experience_level: savedUser.profile.prior_experience_level || 'beginner'
          });
        }

        // Restore user-specific attempts
        const savedAttempts = localStorage.getItem(`skilltwin_attempts_${savedUser.id}`);
        if (savedAttempts) {
          try {
            setAttemptsHistory(JSON.parse(savedAttempts));
          } catch {
            setAttemptsHistory([]);
          }
        }

        // Refresh latest profile from backend database
        SkillTwinAPI.getMe(savedToken).then(freshUser => {
          if (freshUser) {
            setUserEmail(freshUser.email);
            if (freshUser.profile) {
              setProfile({
                user_id: freshUser.id,
                full_name: freshUser.full_name || 'Learner',
                target_role: freshUser.profile.target_role || 'Senior Backend Engineer',
                weekly_hours_budget: freshUser.profile.weekly_hours_budget || 12,
                preferred_learning_style: freshUser.profile.preferred_learning_style || 'hands_on',
                prior_experience_level: freshUser.profile.prior_experience_level || 'beginner'
              });
              localStorage.setItem('skilltwin_session_user', JSON.stringify(freshUser));
            }
          }
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Session hydration notice:', e);
    }
  }, []);

  const resetDomainState = () => {
    initDomainPath(currentDomain);
  };

  const updateProfile = (updates: Partial<LearnerProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        const savedUserStr = localStorage.getItem('skilltwin_session_user');
        if (savedUserStr) {
          try {
            const savedUser = JSON.parse(savedUserStr);
            savedUser.full_name = next.full_name;
            if (savedUser.profile) {
              savedUser.profile.target_role = next.target_role;
              savedUser.profile.weekly_hours_budget = next.weekly_hours_budget;
              savedUser.profile.preferred_learning_style = next.preferred_learning_style;
              savedUser.profile.prior_experience_level = next.prior_experience_level;
            }
            localStorage.setItem('skilltwin_session_user', JSON.stringify(savedUser));
          } catch {}
        }
      }
      return next;
    });

    if (token && token !== 'demo-token-active') {
      SkillTwinAPI.updateProfile(updates, token).catch(() => {});
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const loginUser = async (payloadOrEmail: any, maybePassword?: string): Promise<boolean> => {
    const payload = typeof payloadOrEmail === 'object'
      ? payloadOrEmail
      : { email: payloadOrEmail, password: maybePassword };

    const res = await SkillTwinAPI.login(payload);
    if (res && res.access_token) {
      const userObj = res.user;
      setToken(res.access_token);
      setIsAuthenticated(true);
      setShowLandingPage(false);

      if (userObj) {
        setUserEmail(userObj.email);
        setProfile({
          user_id: userObj.id,
          full_name: userObj.full_name || payload.email?.split('@')[0] || 'Learner',
          target_role: userObj.profile?.target_role || 'Senior Backend Engineer',
          weekly_hours_budget: userObj.profile?.weekly_hours_budget || 12,
          preferred_learning_style: userObj.profile?.preferred_learning_style || 'hands_on',
          prior_experience_level: userObj.profile?.prior_experience_level || 'beginner'
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem('skilltwin_session_token', res.access_token);
          localStorage.setItem('skilltwin_session_user', JSON.stringify(userObj));

          const savedAttempts = localStorage.getItem(`skilltwin_attempts_${userObj.id}`);
          if (savedAttempts) {
            try {
              setAttemptsHistory(JSON.parse(savedAttempts));
            } catch {
              setAttemptsHistory([]);
            }
          } else {
            setAttemptsHistory([]);
          }
        }
      }
      return true;
    }

    // Fallback for offline demo mode
    if (payload.email) {
      setUserEmail(payload.email);
      setProfile(prev => ({
        ...prev,
        user_id: `usr_${payload.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        full_name: payload.email.split('@')[0]
      }));
    }
    setToken('demo-token-active');
    setIsAuthenticated(true);
    setShowLandingPage(false);
    return true;
  };

  const signupUser = async (payloadOrEmail: any, maybePassword?: string, maybeName?: string): Promise<boolean> => {
    const payload = typeof payloadOrEmail === 'object'
      ? payloadOrEmail
      : { email: payloadOrEmail, password: maybePassword, full_name: maybeName };

    setAttemptsHistory([]);

    const res = await SkillTwinAPI.signup(payload);
    if (res && res.access_token) {
      const userObj = res.user;
      setToken(res.access_token);
      setIsAuthenticated(true);
      setShowLandingPage(false);
      setIsOnboardingOpen(true);

      if (userObj) {
        setUserEmail(userObj.email);
        setProfile({
          user_id: userObj.id,
          full_name: userObj.full_name || payload.full_name || 'Learner',
          target_role: userObj.profile?.target_role || payload.target_role || 'Senior Backend Engineer',
          weekly_hours_budget: userObj.profile?.weekly_hours_budget || payload.weekly_hours_budget || 12,
          preferred_learning_style: userObj.profile?.preferred_learning_style || payload.preferred_learning_style || 'hands_on',
          prior_experience_level: userObj.profile?.prior_experience_level || 'beginner'
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem('skilltwin_session_token', res.access_token);
          localStorage.setItem('skilltwin_session_user', JSON.stringify(userObj));
          localStorage.removeItem(`skilltwin_attempts_${userObj.id}`);
        }
      }
      return true;
    }

    if (payload.email) {
      setUserEmail(payload.email);
      setProfile(prev => ({
        ...prev,
        user_id: `usr_${payload.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        full_name: payload.full_name || payload.email.split('@')[0],
        prior_experience_level: 'beginner'
      }));
    }
    setToken('demo-token-active');
    setIsAuthenticated(true);
    setShowLandingPage(false);
    setIsOnboardingOpen(true);
    return true;
  };

  const logoutUser = () => {
    setToken(null);
    setIsAuthenticated(false);
    setShowLandingPage(true);
    setUserEmail('123@gmail.com');
    setProfile({
      user_id: 'usr_demo_01',
      full_name: 'Alex',
      target_role: 'Senior Backend Engineer',
      weekly_hours_budget: 12,
      preferred_learning_style: 'hands_on',
      prior_experience_level: 'beginner'
    });
    setAttemptsHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('skilltwin_session_token');
      localStorage.removeItem('skilltwin_session_user');
    }
  };

  const openAssessment = (skillId?: string) => {
    const targetSkill = skillId || selectedSkillId || currentPath?.nodes.find(n => n.status === 'in_progress' || n.status === 'ready')?.skill_id || currentPath?.nodes[0]?.skill_id;
    if (!targetSkill) return;

    setAssessmentSkillId(targetSkill);
    setSelectedSkillId(targetSkill);
    setIsAssessmentOpen(true);
  };

  const closeAssessment = () => {
    setIsAssessmentOpen(false);
  };

  const openBktModal = () => setIsBktModalOpen(true);
  const closeBktModal = () => setIsBktModalOpen(false);
  const dismissDiffCard = () => setActiveRepairDiff(null);

  const submitAssessmentEvidence = async (
    skillId: string,
    score: number,
    durationSeconds: number = 60,
    answers: any = {}
  ) => {
    const prior = masteryMap.get(skillId) ?? 0.20;

    // 4-Tier Progression Outcome Calibration:
    // 100% (4/4 Correct) -> Mastered Pro (0.95), unlocks next chapter + advanced topics
    // 75%  (3/4 Correct) -> Competent (0.80), unlocks next chapter
    // 50%  (2/4 Correct) -> Basic (0.50), passing standard not met, requires quiz retake
    // 25% or 0%          -> Foundational Gap (0.20), triggers remedial booster repair
    const isCorrect = score >= 0.75;
    let posterior = 0.50;

    if (score >= 1.0) {
      posterior = 0.95;
    } else if (score >= 0.75) {
      posterior = 0.80;
    } else if (score >= 0.50) {
      posterior = 0.50;
    } else {
      posterior = 0.20;
    }

    const { posteriorGivenEvidence } = bktStep(prior, isCorrect);

    const updated = new HybridMasteryMap(Array.from(masteryMap.entries()));
    updated.set(skillId, posterior);
    setMasteryMap(updated);

    // Persist user domain mastery map
    if (typeof window !== 'undefined' && profile.user_id) {
      try {
        const masteryObj: Record<string, number> = {};
        for (const [k, v] of updated.entries()) {
          masteryObj[k] = v;
        }
        localStorage.setItem(`skilltwin_mastery_${profile.user_id}_${currentDomain}`, JSON.stringify(masteryObj));
      } catch {}
    }

    // Update node statuses in active learning path (unmarking locked, marking completed)
    if (currentPath) {
      const updatedNodes = currentPath.nodes.map(node => {
        const mProb = updated.get(node.skill_id) ?? node.mastery_prob;
        const prereqs = node.prerequisite_skill_ids || [];
        const newStatus = evaluateNodeStatus(node.skill_id, mProb, prereqs, updated);
        return {
          ...node,
          mastery_prob: mProb,
          status: newStatus
        };
      });
      const updatedPath = { ...currentPath, nodes: updatedNodes, updated_at: new Date().toISOString() };
      setCurrentPath(updatedPath);

      if (typeof window !== 'undefined' && profile.user_id) {
        try {
          localStorage.setItem(`skilltwin_path_${profile.user_id}_${currentDomain}`, JSON.stringify(updatedPath));
        } catch {}
      }
    }

    const bktResult = {
      skill_id: skillId,
      prior_p_l: prior,
      is_correct: isCorrect,
      posterior_given_evidence: posteriorGivenEvidence,
      posterior_after_transition: posterior,
      timestamp: new Date().toISOString()
    };
    setLatestBktResult(bktResult);

    const attempt = {
      id: `att_${Date.now()}`,
      skill_id: skillId,
      is_correct: isCorrect,
      score,
      duration_seconds: durationSeconds,
      prior_mastery: prior,
      posterior_mastery: posterior,
      timestamp: new Date().toISOString()
    };

    setAttemptsHistory(prev => {
      const next = [attempt, ...prev];
      if (typeof window !== 'undefined' && profile.user_id) {
        try {
          localStorage.setItem(`skilltwin_attempts_${profile.user_id}`, JSON.stringify(next));
        } catch {}
      }
      return next;
    });

    // Send assessment evidence to backend database
    SkillTwinAPI.submitAssessment({
      user_id: profile.user_id,
      skill_id: skillId,
      score,
      evidence_type: 'quiz_result',
      time_spent_seconds: durationSeconds,
      answers
    }, token).catch(() => {});

    if (!isCorrect && posterior < 0.80) {
      await triggerRepair(skillId, true, posterior);
    } else {
      await triggerRepair(skillId, false, posterior);
    }

    return {
      attempt,
      bktResult
    };
  };

  const submitQuizResult = async (skillId: string, isCorrect: boolean, score: number) => {
    await submitAssessmentEvidence(skillId, score, 60);
  };

  const triggerRepair = async (triggerSkillId: string, forceRemedial: boolean = false, updatedMastery?: number) => {
    if (!currentPath) return;

    const oldNodes = [...currentPath.nodes];
    const triggerIdx = oldNodes.findIndex(n => n.skill_id === triggerSkillId);
    const triggerMastery = updatedMastery ?? (masteryMap.get(triggerSkillId) ?? 0.22);

    const inserted: LearningPathNode[] = [];
    const reordered: any[] = [];
    const unchanged: any[] = [];
    const newNodes: LearningPathNode[] = [];

    let currentStep = 1;

    if (forceRemedial && triggerIdx !== -1) {
      for (let i = 0; i < triggerIdx; i++) {
        const n = { ...oldNodes[i], step_order: currentStep++ };
        unchanged.push(n);
        newNodes.push(n);
      }

      const remedialNode: LearningPathNode = {
        node_id: `node_${triggerSkillId}_remedial`,
        step_order: currentStep++,
        skill_id: triggerSkillId,
        skill_name: `${oldNodes[triggerIdx].skill_name} (Remedial Reinforcement)`,
        recommended_resource_id: `res_${triggerSkillId}_remedial_01`,
        status: 'in_progress',
        mastery_prob: triggerMastery,
        prerequisite_skill_ids: oldNodes[triggerIdx].prerequisite_skill_ids,
        estimated_minutes: 30,
        is_remedial: true,
        is_inserted: true
      };
      inserted.push(remedialNode);
      newNodes.push(remedialNode);

      const shiftedTrigger: LearningPathNode = {
        ...oldNodes[triggerIdx],
        step_order: currentStep++,
        status: 'ready',
        mastery_prob: triggerMastery,
        is_reordered: true
      };
      reordered.push({
        node_id: shiftedTrigger.node_id,
        skill_id: triggerSkillId,
        old_step_order: oldNodes[triggerIdx].step_order,
        new_step_order: shiftedTrigger.step_order
      });
      newNodes.push(shiftedTrigger);

      for (let i = triggerIdx + 1; i < oldNodes.length; i++) {
        const shifted = {
          ...oldNodes[i],
          step_order: currentStep++,
          status: 'locked' as const,
          is_reordered: true
        };
        reordered.push({
          node_id: shifted.node_id,
          skill_id: shifted.skill_id,
          old_step_order: oldNodes[i].step_order,
          new_step_order: shifted.step_order
        });
        newNodes.push(shifted);
      }
    } else {
      // Passed assessment: clean up any remedial node for this skill if present, mark completed, unlock next
      const filteredOld = oldNodes.filter(n => !(n.is_remedial && n.skill_id === triggerSkillId));
      let nextUnlocked = false;

      for (let i = 0; i < filteredOld.length; i++) {
        const node = filteredOld[i];
        const sId = node.skill_id;
        const nodeMastery = sId === triggerSkillId ? triggerMastery : (masteryMap.get(sId) ?? node.mastery_prob);
        const isThisTrigger = sId === triggerSkillId;
        const isMastered = nodeMastery >= 0.70;

        let nextStatus = node.status;
        if (isThisTrigger && isMastered) {
          nextStatus = 'completed';
        } else if (!isThisTrigger && !nextUnlocked && (node.status === 'locked' || node.status === 'ready')) {
          nextStatus = 'in_progress';
          nextUnlocked = true;
        }

        const updatedNode = {
          ...node,
          step_order: currentStep++,
          status: nextStatus,
          mastery_prob: nodeMastery
        };
        newNodes.push(updatedNode);
      }
    }

    const touchedCount = inserted.length + reordered.length;
    const diff: any = {
      path_id: currentPath.id,
      previous_version: currentPath.version,
      new_version: currentPath.version + 1,
      trigger_skill_id: triggerSkillId,
      trigger_event: forceRemedial ? 'assessment_failed' : 'assessment_passed',
      removed_nodes: [],
      unchanged_nodes: unchanged,
      inserted_nodes: inserted,
      reordered_nodes: reordered,
      old_path: oldNodes,
      new_path: newNodes,
      metrics: {
        touched_node_count: Math.max(1, touchedCount),
        total_node_count: newNodes.length,
        unchanged_node_count: unchanged.length,
        repair_ratio: Math.round((Math.max(1, touchedCount) / newNodes.length) * 100) / 100
      },
      explanation: forceRemedial
        ? `Mastery for ${triggerSkillId.replace(/_/g, ' ')} adjusted to ${(triggerMastery * 100).toFixed(0)}%. Inserted a targeted foundation chapter to build confidence before moving forward.`
        : `🎉 You passed the quiz! Mastery for ${triggerSkillId.replace(/_/g, ' ')} elevated to ${(triggerMastery * 100).toFixed(0)}%. Time to move on to the next concept!`,
      timestamp: new Date().toISOString()
    };

    setActiveRepairDiff(diff);
    setCurrentPath(prev => prev ? ({
      ...prev,
      version: prev.version + 1,
      nodes: newNodes,
      updated_at: new Date().toISOString()
    }) : null);
  };

  return (
    <SkillTwinContext.Provider
      value={{
        user,
        profile,
        updateProfile,
        skills,
        dependencies,
        masteryMap,
        setMasteryMap,
        selfReportedMap,
        attemptsHistory,
        activeTab,
        setActiveTab,
        currentDomain,
        domainsList,
        switchDomain,
        resetDomainState,
        currentPath,
        activeRepairDiff,
        dismissDiffCard,
        selectedSkillId,
        setSelectedSkillId,
        isAssessmentOpen,
        setIsAssessmentOpen,
        assessmentSkillId,
        openAssessment,
        closeAssessment,
        isBktModalOpen,
        openBktModal,
        closeBktModal,
        latestBktResult,
        isAIChatOpen,
        setIsAIChatOpen,
        isOnboardingOpen,
        setIsOnboardingOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        theme,
        toggleTheme,
        showLandingPage,
        setShowLandingPage,
        token,
        isAuthenticated,
        loginUser,
        signupUser,
        logoutUser,
        backendOnline,
        isLoading,
        recommendations,
        submitQuizResult,
        submitAssessmentEvidence,
        triggerRepair
      }}
    >
      {children}
    </SkillTwinContext.Provider>
  );
}

export function useSkillTwin() {
  const context = useContext(SkillTwinContext);
  if (!context) {
    throw new Error('useSkillTwin must be used within a SkillTwinProvider');
  }
  return context;
}
