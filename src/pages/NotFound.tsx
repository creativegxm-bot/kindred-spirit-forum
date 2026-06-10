import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <div className="min-h-screen grid place-items-center text-center p-6">
    <div>
      <div className="text-6xl mb-2">🃏</div>
      <h1 className="text-3xl font-bold mb-2">Card not found</h1>
      <p className="text-muted-foreground mb-4">This page doesn't exist in the deck.</p>
      <Link to="/"><Button>Back to Lobby</Button></Link>
    </div>
  </div>
);

export default NotFound;
