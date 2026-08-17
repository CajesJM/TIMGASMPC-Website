import { ChevronDown } from "lucide-react";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import { faqs } from "../../data/content";
import styles from "./FaqPage.module.css";

export function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="Frequently asked questions"
        title="Answers to common questions."
        description="Find quick answers about membership, share capital, documents, and cooperative services. For anything else, our team is one message away."
      />
      <section className="section">
        <div className={`container ${styles.list}`}>
          {faqs.map(([question, answer]) => (
            <details className={styles.item} key={question}>
              <summary>
                {question}
                <ChevronDown aria-hidden="true" />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
