import {
    HelpCircle,
    Check
} from "lucide-react";
function QuestionPanel({
    questions,
    answers,
    setAnswer
}) {
    return (
        <section className="question-panel">
            <div className="panel-title">
                <div>
                    <span>
                        AI EXTRACTION
                    </span>
                    <h2>
                        Lead Questions
                    </h2>
                </div>
                <HelpCircle
                    size={17}
                />
            </div>
            <div className="question-list">
                {questions.map(
                    question => (
                        <div
                            className="question-item"
                            key={question.id}
                        >
                            <div className="question-number">
                                {question.id}
                            </div>
                            <div className="question-content">
                                <label>
                                    {question.question}
                                </label>
                                <input
                                    value={
                                        answers[
                                            question.field
                                        ] || ""
                                    }
                                    onChange={
                                        event =>
                                            setAnswer(
                                                question.field,
                                                event.target.value
                                            )
                                    }
                                    placeholder={
                                        question.placeholder
                                    }
                                />
                            </div>
                            {answers[
                                question.field
                            ] && (
                                <Check
                                    className="question-check"
                                    size={16}
                                />
                            )}
                        </div>
                    )
                )}
            </div>
        </section>
    );
}
export default QuestionPanel;