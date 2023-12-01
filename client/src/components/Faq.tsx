import { v4 as uuidv4 } from "uuid";
import "../styles/faq.css";
import PageHeader from "./PageHeader";
import store from "../store/store";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

type Question = {
  title: string;
  answer: string;
  id: string;
};

function Faq() {
  const { t, i18n } = useTranslation();
  const questions: Question[] = useMemo(
    () => [
      {
        title: t("faq1"),
        answer: t("faq1text"),
        id: uuidv4(),
      },
      {
        title: t("faq2"),
        answer: t("faq2text"),
        id: uuidv4(),
      },
      {
        title: t("faq3"),
        answer: t("faq3text"),
        id: uuidv4(),
      },
      {
        title: t("faq4"),
        answer: t("faq4text"),
        id: uuidv4(),
      },
      {
        title: t("faq5"),
        answer: t("faq5text"),
        id: uuidv4(),
      },
    ],
    [i18n.language]
  );
  return (
    <div className="faq_container">
      <PageHeader title="FAQ" handleBackClick={() => (store.faq = false)} />
      <div className="faq_content">
        <h1 className="faq_title">{t("GeneralQuestions")}</h1>
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
    </div>
  );
}

export default Faq;
