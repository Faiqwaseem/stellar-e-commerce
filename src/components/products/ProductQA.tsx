import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircleQuestion, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface QA {
  id: string;
  question: string;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
  user_id: string;
}

export function ProductQA({ productId }: { productId: string }) {
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation();
  const [items, setItems] = useState<QA[]>([]);
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});

  const load = async () => {
    const { data } = await supabase
      .from('product_questions')
      .select('id, question, answer, answered_at, created_at, user_id')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    setItems((data as QA[]) || []);
  };

  useEffect(() => {
    load();
  }, [productId]);

  const submit = async () => {
    if (!user) return;
    if (question.trim().length < 5) {
      toast.error('Question is too short');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('product_questions').insert({
      product_id: productId,
      user_id: user.id,
      question: question.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setQuestion('');
    toast.success('Question submitted');
    load();
  };

  const submitAnswer = async (id: string) => {
    const a = answerDrafts[id]?.trim();
    if (!a) return;
    const { error } = await supabase
      .from('product_questions')
      .update({ answer: a, answered_by: user?.id, answered_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Answer posted');
    setAnswerDrafts((d) => ({ ...d, [id]: '' }));
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircleQuestion className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">{t('questionsAndAnswers')}</h3>
      </div>

      {/* Ask form */}
      {user ? (
        <div className="space-y-2 rounded-xl border bg-card p-4">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t('typeQuestion')}
            className="min-h-[80px]"
            maxLength={500}
          />
          <div className="flex justify-end">
            <Button onClick={submit} disabled={submitting} className="gradient-primary border-0">
              {t('submit')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
          <Link to="/login" className="text-primary font-semibold hover:underline">
            {t('signInToAsk')}
          </Link>
        </div>
      )}

      {/* List */}
      {items.length === 0 ? (
        <p className="text-muted-foreground text-center py-6">{t('noQuestions')}</p>
      ) : (
        <ul className="space-y-4">
          {items.map((q, i) => (
            <motion.li
              key={q.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl border bg-card p-4 space-y-3"
            >
              <div>
                <p className="font-medium">Q: {q.question}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(q.created_at), 'PP')}
                </p>
              </div>

              {q.answer ? (
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2 text-xs text-success font-semibold mb-1">
                    <CheckCircle2 className="h-4 w-4" />
                    {t('answeredBy')}
                  </div>
                  <p className="text-sm">{q.answer}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {t('pendingAnswer')}
                </div>
              )}

              {isAdmin && !q.answer && (
                <div className="space-y-2 pt-2 border-t">
                  <Textarea
                    placeholder="Write your answer…"
                    value={answerDrafts[q.id] || ''}
                    onChange={(e) =>
                      setAnswerDrafts((d) => ({ ...d, [q.id]: e.target.value }))
                    }
                    className="min-h-[60px]"
                  />
                  <Button size="sm" onClick={() => submitAnswer(q.id)}>
                    Post Answer
                  </Button>
                </div>
              )}
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
