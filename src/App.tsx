import './index.css';
import { Button } from '@/components/ui/button';

function App() {
  return (
    <>
      <div className="flex flex-row p-40 items-center justify-center bg-violet-500 m-4">
        <p className="font-bold text-5xl">got.it!</p>
        <Button>Click me</Button>
      </div>
    </>
  );
}

export default App;
