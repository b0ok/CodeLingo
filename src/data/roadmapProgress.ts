import { LanguageId } from '../types';
import { getAllRoadmapNodes } from './pythonRoadmap';
import { getAllJsRoadmapNodes } from './jsRoadmap';
import { getAllWebRoadmapNodes } from './webRoadmap';
import { getAllSqlRoadmapNodes } from './sqlRoadmap';

// Same node source RoadmapModal uses, so every counter shows the same numbers.
export function getRoadmapProgress(language: LanguageId, checkedInNodes: string[] = []) {
  const nodes =
    language === 'web'
      ? getAllWebRoadmapNodes()
      : language === 'javascript'
      ? getAllJsRoadmapNodes()
      : language === 'sql'
      ? getAllSqlRoadmapNodes()
      : getAllRoadmapNodes();
  return {
    verified: nodes.filter((n) => checkedInNodes.includes(n.id)).length,
    total: nodes.length,
  };
}
