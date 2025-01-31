import './index.css';
import { Button } from '@/components/ui/button';

function App() {
  return (
    <>
      <div className="flex flex-col p-40 items-center justify-center bg-main-700 m-4">
        <p className="font-bold text-5xl py-16">Hello world!</p>
        <Button>Click me</Button>
      </div>
    </>
  );
}

export default App;
