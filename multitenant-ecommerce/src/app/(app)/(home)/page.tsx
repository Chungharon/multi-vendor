import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

// http://localhost:3000/admin

export default function Home() {

  return (
    <div className="p-4">
      <div className="flex flex-col gap-y-4">
        <div>
          <Button variant="elevated">
            Click Me
          </Button>
        </div>
        <div>
          <Input placeholder="input text" />
        </div>
        <div>
          <Progress value={50} />
        </div>
        <div>
          <Textarea placeholder="i am textarea" />
        </div>
      </div>
      <div>
        <Checkbox />
      </div>
    </div>
  );
}