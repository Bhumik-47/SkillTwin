import domainQuestions from '../data/questions/domain_questions.json';
import { AssessmentQuestion, LearningPath } from './types';
import { ADVANCED_PRO_QUESTIONS_MAP } from '../data/questions/advanced_pro_questions';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '/api-backend' : 'http://127.0.0.1:8000');

async function safeJson(res: Response) {
  try {
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export class SkillTwinAPI {
  static async getHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET', cache: 'no-store' });
      return res.ok;
    } catch {
      return false;
    }
  }

  static generateDiagnosticFeedback(skillId: string, scorePct: number, skillName?: string): string {
    const name = skillName || skillId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const scoreText = scorePct <= 25 ? 'significant foundational gaps (score <= 25%)' : 'partial comprehension (score: 50%)';

    const TOPIC_DIAGNOSTICS: Record<string, string> = {
      threads_and_processes: `Diagnostic Analysis: You struggled with thread synchronization and race condition mechanisms in ${name}. Core gaps identified: (1) Distinguishing between shared process heap memory and thread-isolated stack memory, and (2) Mutex lock lifecycles during concurrent state mutations. A focused remedial practice chapter has been scheduled so you can master OS concurrency primitives before moving forward.`,
      http_basics: `Diagnostic Analysis: You missed core questions on HTTP protocols in ${name}. Key gaps: Distinguishing between 0-RTT replay attack vulnerabilities in HTTP/3 vs Keep-Alive connection pooling in HTTP/1.1/2. Reviewing request idempotency and status code semantics is required before moving to API design.`,
      tcp_ip_sockets: `Diagnostic Analysis: Identified misconceptions in ${name} regarding the TCP 3-way handshake, TIME_WAIT port exhaustion, and BBR vs loss-based congestion control. Sockets and kernel buffer boundaries must be reinforced before distributed networking.`,
      rest_api_design: `Diagnostic Analysis: Gaps identified in RESTful architectural constraints and HTTP verb semantics (PUT vs PATCH idempotency). Reinforcing standardized HTTP error responses (400 vs 422 vs 500) will ensure robust API contract designs.`,
      sql_fundamentals: `Diagnostic Analysis: Core weakness in relational joins (INNER vs LEFT vs FULL OUTER) and aggregate grouping logic. Solidifying SQL query execution order is necessary before database indexing.`,
      database_indexing: `Diagnostic Analysis: Identified gaps in B-Tree index traversal vs Full Table Scans, and compound index leftmost-prefix rules. Understanding query planner cost estimation is vital before advanced database optimization.`,
      redis_caching: `Diagnostic Analysis: Gaps in cache eviction policies (LRU/LFU) and Cache-Aside vs Write-Through strategies. Understanding cache stampede mitigation will prevent database bottlenecks.`,
      docker_basics: `Diagnostic Analysis: Misconceptions in Docker container layer caching and volume persistence vs image immutability. Mastering Dockerfile instruction order is needed before container orchestration.`,
      git_fundamentals: `Diagnostic Analysis: Identified confusion between merge commits, fast-forwarding, and git rebase history rewriting. Understanding commit pointer graphs is crucial before collaborative branch workflows.`,
      async_programming: `Diagnostic Analysis: Identified gaps in Event Loop task queues, microtasks vs macrotasks, and blocking vs non-blocking I/O calls. Understanding coroutine lifecycle prevents deadlocks in high-concurrency servers.`,
    };

    if (TOPIC_DIAGNOSTICS[skillId]) {
      return TOPIC_DIAGNOSTICS[skillId];
    }

    return `Diagnostic Analysis: Your assessment indicated ${scoreText} in ${name}. Specific conceptual gaps were detected in prerequisite building blocks and syntax usage. An extra remedial practice session was added to strengthen your understanding before advancing.`;
  }


  static async getQuestionsForSkill(
    skillId: string,
    optionsOrName?: {
      skillName?: string;
      domain?: string;
      isRemedial?: boolean;
      isAdvanced?: boolean;
      masteryProb?: number;
      attemptCount?: number;
    } | string,
    maybeDomain?: string
  ): Promise<AssessmentQuestion[]> {
    const opts = typeof optionsOrName === 'object' && optionsOrName !== null
      ? optionsOrName
      : { skillName: typeof optionsOrName === 'string' ? optionsOrName : undefined, domain: maybeDomain };

    const skillName = opts.skillName;
    const isRemedial = !!opts.isRemedial;
    const mastery = opts.masteryProb ?? 0.10;
    const isAdvanced = mastery >= 0.90 || !!opts.isAdvanced;
    const attemptCount = opts.attemptCount ?? 0;

    // If learner is at Level 4 Mastered Pro (BKT >= 0.90 / 0.95), deliver the Elite Advanced Challenge!
    if (isAdvanced && ADVANCED_PRO_QUESTIONS_MAP[skillId] && ADVANCED_PRO_QUESTIONS_MAP[skillId].length > 0) {
      return ADVANCED_PRO_QUESTIONS_MAP[skillId];
    }

    try {
      const res = await fetch(`${API_BASE_URL}/assessments/questions?skill_id=${encodeURIComponent(skillId)}`, {
        method: 'GET',
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await safeJson(res);
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
        if (data && Array.isArray(data.questions) && data.questions.length > 0) {
          return data.questions;
        }
      }
    } catch {
      // fallback to local dataset
    }

    const allQuestions: AssessmentQuestion[] = (domainQuestions as any).questions || [];
    const matched = allQuestions.filter(q => q.skill_id === skillId);

    if (matched.length > 0) {
      // Always deliver the full comprehensive question bank (all stages 1..4) so learners get complete practice on retakes
      const sorted = [...matched].sort((a, b) => (a.stage || 1) - (b.stage || 1));
      return sorted;
    }

    const label = skillName || skillId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    
    if (isRemedial) {
      return [
        {
          id: `q_${skillId}_s1_auto`,
          skill_id: skillId,
          stage: 1,
          difficulty: 'foundational',
          tier: 'remedial_1',
          concept_primer: `💡 Foundation Concept: Let's review the fundamental building blocks of ${label}. Understanding the core purpose is the first step before tackling advanced scenarios.`,
          hint: `Think about the primary problem that ${label} solves in modern software development.`,
          prompt: `What is the primary conceptual purpose of ${label}?`,
          options: [
            {
              id: 'a',
              text: `To provide clear, modular, and reliable operations for ${label} systems`,
              is_correct: true,
              explanation: `Correct! Mastering the core purpose of ${label} provides the necessary foundation for advanced concepts.`
            },
            {
              id: 'b',
              text: 'To introduce arbitrary execution delays in the program',
              is_correct: false,
              explanation: 'Software patterns are designed to improve maintainability and reliability, not slow down execution.'
            },
            {
              id: 'c',
              text: 'To suppress runtime errors without logging',
              is_correct: false,
              explanation: 'Proper error handling requires explicit logging and recovery.'
            }
          ]
        },
        {
          id: `q_${skillId}_s2_auto`,
          skill_id: skillId,
          stage: 2,
          difficulty: 'basic',
          tier: 'remedial_2',
          concept_primer: `💡 Application Concept: How ${label} is applied in standard workflows.`,
          hint: `Consider the standard syntax and convention for ${label}.`,
          prompt: `What is the standard best-practice convention when working with ${label}?`,
          options: [
            {
              id: 'a',
              text: 'Following idiomatic patterns and structured error boundaries',
              is_correct: true,
              explanation: 'Correct! Idiomatic conventions ensure predictable and testable code.'
            },
            {
              id: 'b',
              text: 'Hardcoding arbitrary magic constants across codebase',
              is_correct: false,
              explanation: 'Magic numbers make code difficult to maintain.'
            }
          ]
        }
      ];
    }

    return [
      {
        id: `q_${skillId}_s1_auto`,
        skill_id: skillId,
        stage: 1,
        difficulty: 'foundational',
        tier: 'remedial_1',
        concept_primer: `💡 Foundation Concept: Overview of ${label} fundamentals.`,
        hint: `Think about the foundational purpose of ${label}.`,
        prompt: `What is the fundamental purpose of ${label}?`,
        options: [
          {
            id: 'a',
            text: `To establish solid architectural foundations for ${label}`,
            is_correct: true,
            explanation: `Correct! Solid foundations in ${label} enable reliable engineering.`
          },
          {
            id: 'b',
            text: 'To bypass testing and verification suites',
            is_correct: false,
            explanation: 'Testing is essential to verified mastery.'
          }
        ]
      },
      {
        id: `q_${skillId}_s2_auto`,
        skill_id: skillId,
        stage: 2,
        difficulty: 'basic',
        tier: 'standard',
        prompt: `How should common operations in ${label} be structured?`,
        options: [
          {
            id: 'a',
            text: 'Using modular decomposition and predictable data flow',
            is_correct: true,
            explanation: 'Correct! Predictable data flow avoids hidden side effects.'
          },
          {
            id: 'b',
            text: 'Using unbounded global state mutations',
            is_correct: false,
            explanation: 'Global mutations create race conditions.'
          }
        ]
      },
      {
        id: `q_${skillId}_s3_auto`,
        skill_id: skillId,
        stage: 3,
        difficulty: 'intermediate',
        tier: 'standard',
        prompt: `Which principle is essential when implementing production systems for ${label}?`,
        options: [
          {
            id: 'a',
            text: 'Defensive boundary validation, explicit error handling, and modular decoupling',
            is_correct: true,
            explanation: `Correct! Defensive validation and modular encapsulation are core to mastering ${label}.`
          },
          {
            id: 'b',
            text: 'Suppressing all runtime exceptions silently',
            is_correct: false,
            explanation: 'Suppressing exceptions masks failures and violates production reliability principles.'
          },
          {
            id: 'c',
            text: 'Relying exclusively on unbounded global shared mutable state',
            is_correct: false,
            explanation: 'Global shared mutable state introduces race conditions and test fragility.'
          }
        ]
      },
      {
        id: `q_${skillId}_s4_auto`,
        skill_id: skillId,
        stage: 4,
        difficulty: 'advanced',
        tier: 'challenge',
        prompt: `In high-scale deployments of ${label}, which optimization strategy provides maximum resiliency?`,
        options: [
          {
            id: 'a',
            text: 'Fine-grained concurrency control, backpressure handling, and graceful degradation',
            is_correct: true,
            explanation: 'Correct! Concurrency bounds and backpressure safeguard distributed architectures under peak load.'
          },
          {
            id: 'b',
            text: 'Disabling all monitoring metrics to save CPU cycles',
            is_correct: false,
            explanation: 'Observability is critical for high-scale resilience.'
          }
        ]
      }
    ];
  }

  static async sendChatMessage(
    prompt: string,
    skillId: string | null,
    currentPath: LearningPath | null,
    domain: string,
    masteryMap: any
  ): Promise<{ reply: string; grounding?: any }> {
    const q = prompt.toLowerCase().trim();

    // 1. Call Backend Gemini AI Chat Endpoint
    try {
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: prompt,
          skill_id: skillId,
          domain: domain || 'backend_engineering',
          mastery_prob: typeof masteryMap?.get === 'function' && skillId ? (masteryMap.get(skillId) ?? 0.40) : 0.40
        })
      });
      if (res.ok) {
        const data = await safeJson(res);
        if (data && data.reply) {
          return {
            reply: data.reply,
            grounding: data.grounding || { source: data.source || 'gemini_ai' }
          };
        }
      }
    } catch {
      // Offline fallback continues below
    }

    // 2. Intelligent Educational Knowledge Engine
    const mastery = skillId ? (typeof masteryMap?.get === 'function' ? masteryMap.get(skillId) : masteryMap?.[skillId]) ?? 0.40 : 0.40;
    const masteryPercent = Math.round(mastery * 100);
    const activeSkillName = skillId ? skillId.replace(/_/g, ' ') : 'your current chapter';

    // Topic: FastAPI
    if (q.includes('fastapi') || q.includes('fast api')) {
      return {
        reply: `**FastAPI** is a modern, high-performance web framework for Python built on Starlette and Pydantic.\n\n### Key Advantages:\n- **High Speed**: Async/await ASGI architecture offering performance on par with NodeJS and Go.\n- **Automatic Validation**: Uses Python type hints and Pydantic schemas to validate query parameters, request bodies, and headers automatically.\n- **Interactive Docs**: Automatically generates interactive OpenAPI (Swagger UI) documentation at \`/docs\`.\n- **Dependency Injection**: Powerful dependency system for database sessions, authentication, and security headers.`,
        grounding: { topic: 'FastAPI', domain: 'backend_engineering' }
      };
    }

    // Topic: Redis & Caching
    if (q.includes('redis') || q.includes('caching') || q.includes('cache')) {
      return {
        reply: `**Redis (Remote Dictionary Server)** is an in-memory key-value data store used primarily as a low-latency database, cache, and message broker.\n\n### Why Redis is Essential in Backend Engineering:\n1. **Sub-millisecond Latency**: Operations execute in memory (RAM) rather than on disk.\n2. **Cache-Aside Pattern**: Applications check Redis first before running expensive database queries. If missing, it fetches from SQL, writes to Redis with a TTL (time-to-live), and returns the data.\n3. **Rich Data Structures**: Supports strings, hashes, lists, sets, sorted sets, and hyperloglogs.\n4. **Session & Rate Limiting**: Ideal for managing auth sessions and API rate counters.`,
        grounding: { topic: 'Redis Caching', domain: 'backend_engineering' }
      };
    }

    // Topic: Database Indexing / B-Trees
    if (q.includes('index') || q.includes('indexing') || q.includes('b-tree') || q.includes('btree')) {
      return {
        reply: `**Database Indexing** creates a specialized data structure (most commonly a **B-Tree** or B+Tree) to drastically accelerate search queries on SQL tables.\n\n### How It Works:\n- **Without Index**: The database must perform a *Full Table Scan* with $O(N)$ time complexity.\n- **With Index**: The B-Tree organizes keys hierarchically, enabling lookups, range scans, and joins in $O(\\log N)$ time.\n- **Trade-off**: Indexes speed up \`SELECT\` queries but add slight overhead to \`INSERT\`, \`UPDATE\`, and \`DELETE\` operations because the tree must be rebalanced.`,
        grounding: { topic: 'Database Indexing', domain: 'backend_engineering' }
      };
    }

    // Topic: SQL vs NoSQL
    if (q.includes('sql vs nosql') || q.includes('nosql') || q.includes('postgres') || q.includes('mongodb')) {
      return {
        reply: `### SQL (Relational) vs. NoSQL (Non-Relational)\n\n- **SQL (PostgreSQL, MySQL)**: Enforces structured tables with rigid schemas, foreign keys, and ACID transactions. Best for financial systems, inventory, and complex multi-table joins.\n- **NoSQL (MongoDB, DynamoDB, Cassandra)**: Stores unstructured or polymorphic data as JSON documents or key-value pairs with horizontal scalability. Best for high-velocity telemetry, event logs, and rapid prototyping.\n\n*Rule of thumb:* Start with PostgreSQL unless you have specialized distributed write requirements that necessitate a NoSQL cluster.`,
        grounding: { topic: 'Databases', domain: 'backend_engineering' }
      };
    }

    // Topic: Big O Notation / Algorithm Complexity
    if (q.includes('big o') || q.includes('complexity') || q.includes('time complexity') || q.includes('data structure')) {
      return {
        reply: `**Big-O Notation** measures the worst-case growth rate of an algorithm's execution time or memory as the input size ($N$) scales:\n\n- **$O(1)$ Constant**: Instant dictionary/hash map lookup by key.\n- **$O(\\log N)$ Logarithmic**: Binary Search on a sorted array.\n- **$O(N)$ Linear**: Single loop scanning through an array.\n- **$O(N \\log N)$ Linearithmic**: Efficient sorting algorithms (Merge Sort, Timsort, Quick Sort).\n- **$O(N^2)$ Quadratic**: Nested loops (e.g. Bubble Sort, comparing every item to every other item).`,
        grounding: { topic: 'Data Structures & Algorithms', domain: 'python_fundamentals' }
      };
    }

    // Topic: Python Decorators & Generators
    if (q.includes('decorator') || q.includes('generator') || q.includes('yield')) {
      return {
        reply: `### Python Decorators & Generators:\n\n1. **Decorators (\`@func\`)**: Functions that wrap other functions to extend their behavior without modifying original code (e.g. logging, authentication checks, caching with \`@lru_cache\`).\n2. **Generators (\`yield\`)**: Functions that produce a sequence of values on-demand using the iterator protocol. Because they compute values lazily, they use $O(1)$ memory rather than loading entire million-row datasets into RAM at once.`,
        grounding: { topic: 'Python Advanced', domain: 'python_fundamentals' }
      };
    }

    // Topic: Flexbox vs Grid / CSS
    if (q.includes('flexbox') || q.includes('css grid') || q.includes('css') || q.includes('frontend')) {
      return {
        reply: `### CSS Flexbox vs. CSS Grid:\n\n- **Flexbox (1-Dimensional)**: Designed for aligning items along a single axis (either horizontal row or vertical column). Best for navigation bars, button clusters, and aligning items inside cards.\n- **CSS Grid (2-Dimensional)**: Designed for dual-axis layout systems with defined rows and columns. Best for overall page architectures, photo galleries, and bento dashboards.`,
        grounding: { topic: 'CSS & Modern Layouts', domain: 'web_basics' }
      };
    }

    // Topic: Pandas & DataFrames
    if (q.includes('pandas') || q.includes('dataframe') || q.includes('numpy') || q.includes('data analysis')) {
      return {
        reply: `**Pandas** is Python's primary data manipulation library, centered around the **DataFrame** (a 2D table with labelled rows and columns).\n\n### Key Methods:\n- \`.groupby('column').agg()\` — Fast aggregations and summary statistics.\n- \`.merge(df1, df2, on='id')\` — SQL-style inner, left, and outer joins.\n- **Vectorization**: Pandas operations run in compiled C/NumPy under the hood, running hundreds of times faster than standard Python \`for\` loops.`,
        grounding: { topic: 'Data Analysis with Pandas', domain: 'data_analysis' }
      };
    }

    // Topic: What should I study next?
    if (q.includes('study next') || q.includes('what next') || q.includes('where to start') || q.includes('current chapter')) {
      const remaining = currentPath?.nodes.filter(n => (masteryMap.get(n.skill_id) ?? 0) < 0.80) || [];
      const nextChapter = remaining[0];
      const name = nextChapter?.skill_name || activeSkillName;
      return {
        reply: `Based on your active study plan, your immediate focus is **${name}**.\n\nYour current skill level in this topic is **${masteryPercent}%** (Target: 80%). Take a quick 3-minute practice quiz to test your understanding and unlock the subsequent chapters in your roadmap!`,
        grounding: {
          active_chapter: name,
          skill_level: `${masteryPercent}%`,
          unmastered_chapters_left: remaining.length
        }
      };
    }

    // Topic: Why did my plan update?
    if (q.includes('why') && (q.includes('update') || q.includes('change') || q.includes('repair') || q.includes('adapt'))) {
      return {
        reply: `Your study plan adapts in real time after every practice quiz! If an assessment reveals that a concept needs reinforcement, SkillTwin schedules an extra practice chapter right before harder topics.\n\nCrucially, **your previous achievements remain 100% intact** — the system never resets your entire course.`,
        grounding: {
          adaptation_policy: 'Targeted Remedial Insertion',
          preservation_guarantee: 'Non-destructive DAG unblocking'
        }
      };
    }

    // Topic: Interview Prep
    if (q.includes('interview') || q.includes('job') || q.includes('career') || q.includes('resume')) {
      return {
        reply: `### Technical Interview Preparation Guide:\n\n1. **Core Data Structures & Algorithms**: Master Arrays, Hash Maps, Two Pointers, Trees, and BFS/DFS graph traversals.\n2. **System Design & API Architecture**: Be ready to explain RESTful design, caching with Redis, database indexing, and scaling strategies.\n3. **Practical Project Experience**: Build and deploy an end-to-end full-stack or backend service with automated tests and CI/CD.`,
        grounding: { topic: 'Interview Strategy' }
      };
    }

    // Topic: Course Overview / Syllabus
    if (q.includes('what will i learn') || q.includes('course') || q.includes('syllabus') || q.includes('curriculum') || q.includes('about this')) {
      const domainTopics: Record<string, string> = {
        backend_engineering: 'networking protocols (HTTP/3, TCP/IP, DNS), relational data modeling, database indexing, Redis caching, async event loops, and containerization with Docker',
        python_fundamentals: 'core Python syntax, control flow, functions, OOP principles, decorators, generators, and exception handling',
        web_basics: 'semantic HTML5, responsive CSS layouts (Flexbox & Grid), JavaScript ES6+ state management, and DOM manipulation',
        data_analysis_pandas_numpy: 'NumPy array operations, Pandas DataFrames, data cleaning, aggregation, exploratory data analysis, and visualization'
      };
      const topicsStr = domainTopics[domain] || 'core concepts from foundational primitives to advanced production workflows';
      return {
        reply: `In the **${domain.replace(/_/g, ' ').toUpperCase()}** track, you will learn **${topicsStr}**.\n\nSkillTwin structures these modules into a personalized DAG roadmap with real-time Bayesian Knowledge Tracing and practice quizzes.`,
        grounding: { topic: 'Course Syllabus', domain }
      };
    }

    // Topic: Greetings / Identity
    if (q.startsWith('hi') || q.startsWith('hello') || q.startsWith('hey') || q.startsWith('who are you') || q.includes('help')) {
      return {
        reply: `Hello! I'm your **SkillTwin AI Learning Assistant**. You can ask me to explain any technical concept, summarize your roadmap chapters, or give study and interview tips. What would you like to explore?`,
        grounding: { topic: 'AI Assistant', domain }
      };
    }

    // Default Concise AI Synthesis Reply
    return {
      reply: `**${prompt.trim().replace(/\?+$/, '')}** is an important concept in ${domain.replace(/_/g, ' ').toUpperCase()}. In practical systems, focus on predictable state execution, modular component design, and robust error handling.\n\n*Current Chapter:* **${activeSkillName}** (${masteryPercent}%).`,
      grounding: {
        domain,
        selected_skill: skillId,
        skill_level: `${masteryPercent}%`,
        source: 'skilltwin_ai'
      }
    };
  }

  static async analyzeGoal(prompt: string, domain?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/goals/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, domain })
      });
      if (res.ok) return await safeJson(res);
    } catch (e) {
      console.warn('API analyzeGoal notice:', e);
    }
    return null;
  }

  static async generatePath(payload: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/learning-path/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await safeJson(res);
    } catch (e) {
      console.warn('API generatePath notice:', e);
    }
    return null;
  }

  static async adaptPath(payload: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/adapt-path`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await safeJson(res);
    } catch (e) {
      console.warn('API adaptPath notice:', e);
    }
    return null;
  }

  static async submitAssessment(payload: any, token?: string | null) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token && !token.startsWith('demo-')) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE_URL}/assessment/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (res.ok) return await safeJson(res);
    } catch (e) {
      console.warn('API submitAssessment notice:', e);
    }
    return null;
  }

  static async getLearnerProgress(token?: string | null, goalId?: string) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token && token !== 'demo-token-active') {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const url = `${API_BASE_URL}/progress` + (goalId ? `?goal_id=${encodeURIComponent(goalId)}` : '');
      const res = await fetch(url, { method: 'GET', headers, cache: 'no-store' });
      if (res.ok) return await safeJson(res);
    } catch (e) {
      console.warn('API getLearnerProgress notice:', e);
    }
    return null;
  }

  static async getRecommendations(userId: string, domain?: string) {
    try {
      const url = `${API_BASE_URL}/recommendations?user_id=${encodeURIComponent(userId)}` + (domain ? `&domain=${encodeURIComponent(domain)}` : '');
      const res = await fetch(url, { method: 'GET', cache: 'no-store' });
      if (res.ok) return await safeJson(res);
    } catch (e) {
      console.warn('API getRecommendations notice:', e);
    }
    return { recommendations: [] };
  }

  static async getSkillGraph(domain?: string) {
    try {
      const url = `${API_BASE_URL}/skill-graph` + (domain ? `?domain=${encodeURIComponent(domain)}` : '');
      const res = await fetch(url, { method: 'GET', cache: 'no-store' });
      if (res.ok) return await safeJson(res);
    } catch (e) {
      console.warn('API getSkillGraph notice:', e);
    }
    return null;
  }

  static async login(payload: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await safeJson(res);
      const err = await safeJson(res);
      if (err && err.detail) throw new Error(err.detail);
    } catch (e: any) {
      console.warn('API login notice:', e?.message || e);
      if (e?.message) throw e;
    }
    return null;
  }

  static async signup(payload: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await safeJson(res);
      const err = await safeJson(res);
      if (err && err.detail) throw new Error(err.detail);
    } catch (e: any) {
      console.warn('API signup notice:', e?.message || e);
      if (e?.message) throw e;
    }
    return null;
  }

  static async getMe(token: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      });
      if (res.ok) return await safeJson(res);
    } catch (e) {
      console.warn('API getMe notice:', e);
    }
    return null;
  }

  static async updateProfile(payload: any, token: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await safeJson(res);
    } catch (e) {
      console.warn('API updateProfile notice:', e);
    }
    return null;
  }
}

