'use client';

import React from 'react';
import DAGCanvas from './DAGCanvas';
import SkillDetailDrawer from './SkillDetailDrawer';
import { useSkillTwin } from '../../lib/state/store';

export default function SkillGraphView() {
  return (
    <div className="relative w-full">
      <DAGCanvas />
      <SkillDetailDrawer />
    </div>
  );
}
