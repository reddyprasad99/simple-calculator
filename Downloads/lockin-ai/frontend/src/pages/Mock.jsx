import Placeholder from '@/components/Placeholder';
import { Timer } from 'lucide-react';
export default function Mock() {
  return <Placeholder icon={Timer} title="Start Interview" phase="Phase 2"
    desc="Timed practice with per-question scoring, feedback, and follow-ups. Questions will pull from your resume analysis for personalized sessions." />;
}
