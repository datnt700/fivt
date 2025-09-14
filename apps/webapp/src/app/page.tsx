import ChatBot from "@/app/chatbot/page";
import { redirect } from 'next/navigation';
import {auth} from "../../auth";

const LandingPage = async () => {
    const session = await auth();
    if (!session || !session.user) {
        return redirect('/auth/login');
    }
  return (
      <div className="min-h-screen bg-background">
          <ChatBot />
      </div>
  );
}

export default LandingPage;