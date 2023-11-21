import { v4 as uuidv4 } from "uuid";
import "../styles/faq.css";
import PageHeader from "./PageHeader";
import store from "../store/store";

type Question = {
  title: string;
  answer: string;
  id: string;
};
const questions: Question[] = [
  {
    title: "What is Telegram? What do I do here?",
    answer: `Telegram is a messaging app with a focus on speed and security, it’s super-fast, simple and free.
    You can use Telegram on all your devices at the same time — your messages sync seamlessly across any number of your phones, tablets or computers.
     Telegram has over 700 million monthly active users and is one of the 10 most downloaded apps in the world.

    With Telegram, you can send messages, photos, videos and files of any type (doc, zip, mp3, etc),
    as well as create groups for up to 200,000 people or channels for broadcasting to unlimited audiences.
    You can write to your phone contacts and find people by their usernames. 
    As a result, Telegram is like SMS and email combined — and can take care of all your personal or business messaging needs. 
    In addition to this, we support end-to-end encrypted voice and video calls, as well as voice chats in groups for thousands of participants.`,
    id: uuidv4(),
  },
  {
    title: "Who is Telegram for?",
    answer: `Telegram is for everyone who wants fast and reliable messaging and calls. 
    Business users and small teams may like the large groups, usernames, desktop apps and powerful file sharing options.

    Since Telegram groups can have up to 200,000 members, we support replies, mentions and hashtags that help maintain order and keep communication in large communities efficient. 
    You can appoint admins with advanced tools to help these communities prosper in peace. 
    Public groups can be joined by anyone and are powerful platforms for discussions and collecting feedback.
    
    In case you're more into pictures, Telegram has animated gif search, a state of the art photo editor, and an open sticker platform (find some cool stickers here or here). 
    What's more, there is no need to worry about disk space on your device. 
    With Telegram's cloud support and cache management options, Telegram can take up nearly zero space on your phone.
    
    Those looking for extra privacy should check out our advanced settings and rather revolutionary policy. 
    And if you want secrecy, try our device-specific Secret Chats with self-destructing messages, photos, and videos — and lock your app with an additional passcode.`,
    id: uuidv4(),
  },
  {
    title: "How is Telegram different from WhatsApp?",
    answer: `Unlike WhatsApp, Telegram is a cloud-based messenger with seamless sync. As a result, you can access your messages from several devices at once, including tablets and computers, and share an unlimited number of photos, videos and files (doc, zip, mp3, etc.) of up to 2 GB each.

    Telegram needs less than 100 MB on your device – you can keep all your media in the cloud without deleting things – simply clear your cache to free up space.
    
    Thanks to Telegram's multi-data center infrastructure and encryption, it is faster and way more secure. On top of that, private messaging on Telegram is free and will stay free — no ads, no subscription fees, forever.
    
    Telegram's API and code is open, and developers are welcome to create their own Telegram apps. We also have a Bot API, a platform for developers that allows anyone to easily build specialized tools for Telegram, integrate any services, and even accept payments from users around the world.
    
    And that's just the tip of the iceberg.`,
    id: uuidv4(),
  },
  {
    title: "How old is Telegram?",
    answer:
      "Telegram for iOS was launched on August 14, 2013. The alpha version of Telegram for Android officially launched on October 20, 2013. More and more Telegram clients appear, built by independent developers using Telegram's open platform.",
    id: uuidv4(),
  },
  {
    title: "Which devices can I use?",
    answer:
      "You can use Telegram on smartphones, tablets, and even computers. We have apps for iOS (11.0 and above), Android (6.0 and up), a native macOS app and a universal desktop app for Windows, macOS, and Linux. Telegram Web can also help to quickly do something on the go.",
    id: uuidv4(),
  },
];
function Faq() {
  return (
    <div className="faq_container">
      <PageHeader title="FAQ" handleBackClick={() => (store.faq = false)} />
      <h1 className="faq_title">General Questions</h1>
      <div className="faq_questions">
        {questions.map((q) => (
          <div key={q.id} className="faq_question">
            <h2 className="faq_question_title">
              <span className="bold">Q: </span>
              {q.title}
            </h2>
            <p className="faq_question_body">{q.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Faq;
