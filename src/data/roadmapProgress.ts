import { LanguageId } from '../types';
import { getAllRoadmapNodes } from './pythonRoadmap';
import { getAllJsRoadmapNodes } from './jsRoadmap';
import { getAllWebRoadmapNodes } from './webRoadmap';

// Same node source RoadmapModal uses, so every counter shows the same numbers.
export function getRoadmapProgress(language: LanguageId, checkedInNodes: string[] = []) {
  const nodes =
    language === 'web' ? getAllWebRoadmapNodes() : language === 'javascript' ? getAllJsRoadmapNodes() : getAllRoadmapNodes();
  return {
    verified: nodes.filter((n) => checkedInNodes.includes(n.id)).length,
    total: nodes.length,
  };
}
