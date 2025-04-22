import Tabs from '../components/Tabs';

export default function Predicted() {
  return (
    <div>
      <Tabs selectedTab="predicted" setSelectedTab={() => {}} darkMode={false} />
      <h1>Welcome to the AI Predicted Page</h1>
    </div>
  );
}