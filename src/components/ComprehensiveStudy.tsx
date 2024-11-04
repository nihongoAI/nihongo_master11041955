import React, { useState, useRef } from 'react';
import { ArrowLeft, MessageCircle, CheckCircle2, XCircle, Heart, Trophy, Play, Pause, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Question {
  type: 'choice' | 'translation' | 'dialogue' | 'word-order' | 'video-choice';
  question: string;
  context?: string;
  options?: string[];
  correct: string | number;
  explanation: string;
  hint?: string;
  words?: { text: string; order: number }[];
  audio?: string;
  video?: string;
  sentence?: {
    prefix?: string;
    suffix?: string;
  };
}

const lessons = [
  {
    id: 1,
    title: '自己紹介',
    questions: [
      {
        type: 'video-choice',
        question: '動画を見て、適切な言葉を選んでください。',
        video: '/videos/self-introduction.mp4',
        sentence: {
          prefix: 'はじめまして、私は',
          suffix: 'です。'
        },
        options: ['田中', '山田', '佐藤', '鈴木'],
        correct: 0,
        explanation: '動画の人物は「田中」と自己紹介しています。',
        hint: '動画をもう一度見てみましょう。'
      },
      {
        type: 'word-order',
        question: '音声を聞いて、単語を正しい順序に並べ替えてください。',
        words: [
          { text: 'です。', order: 3 },
          { text: '学生', order: 2 },
          { text: '私は', order: 1 }
        ],
        correct: '私は学生です。',
        explanation: '「私は[名詞]です」は基本的な自己紹介の形です。',
        hint: '「私は」で始まる文章です。',
        audio: '/audio/watashi-wa-gakusei-desu.mp3'
      },
      {
        type: 'word-order',
        question: '音声を聞いて、単語を正しい順序に並べ替えてください。',
        words: [
          { text: 'です。', order: 3 },
          { text: '先生', order: 2 },
          { text: '私は', order: 1 }
        ],
        correct: '私は先生です。',
        explanation: '「私は[職業]です」は職業を説明する基本的な形です。',
        hint: '「私は」で始まる文章です。',
        audio: '/audio/watashi-wa-sensei-desu.mp3'
      }
    ]
  }
];

export default function ComprehensiveStudy() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lives, setLives] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [orderedWords, setOrderedWords] = useState<{ text: string; order: number }[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const lesson = lessons[currentLesson];
  const question = lesson.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / lesson.questions.length) * 100;

  const handleNext = () => {
    if (currentQuestion < lesson.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentLesson < lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
      setCurrentQuestion(0);
    } else {
      navigate('/');
    }
    setSelectedAnswer(null);
    setShowAnswer(false);
    setShowHint(false);
    setIsPlaying(false);
    setOrderedWords([]);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
    }
  };

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleAudioPlay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowAnswer(true);

    if (answerIndex === question.correct) {
      setScore(score + 10);
    } else {
      setLives(lives - 1);
    }
  };

  const checkWordOrder = () => {
    const userAnswer = orderedWords.map(word => word.text).join('');
    setShowAnswer(true);
    
    if (userAnswer === question.correct) {
      setScore(score + 10);
    } else {
      setLives(lives - 1);
    }
  };

  const renderQuestion = () => {
    if (question.type === 'video-choice') {
      return (
        <div className="space-y-6">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              src={question.video}
              onEnded={() => setIsPlaying(false)}
            />
            <button
              onClick={handleVideoPlay}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-opacity"
            >
              {isPlaying ? (
                <Pause className="h-12 w-12 text-white" />
              ) : (
                <Play className="h-12 w-12 text-white" />
              )}
            </button>
          </div>

          <div className="text-center space-y-4">
            <p className="text-lg font-medium">
              {question.sentence?.prefix}
              <span className="mx-2 text-indigo-600 border-b-2 border-indigo-600">
                {selectedAnswer !== null ? question.options?.[selectedAnswer] : '____'}
              </span>
              {question.sentence?.suffix}
            </p>

            <div className="grid grid-cols-2 gap-3">
              {question.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !showAnswer && handleAnswer(index)}
                  disabled={showAnswer}
                  className={`p-4 text-center rounded-lg border ${
                    showAnswer
                      ? index === question.correct
                        ? 'bg-green-50 border-green-200'
                        : index === selectedAnswer
                        ? 'bg-red-50 border-red-200'
                        : 'bg-white border-gray-200'
                      : 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (question.type === 'word-order') {
      return (
        <div className="space-y-6">
          {question.audio && (
            <>
              <audio ref={audioRef} src={question.audio} />
              <button
                onClick={handleAudioPlay}
                className="flex items-center justify-center w-full p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Volume2 className="h-6 w-6 text-indigo-600 mr-2" />
                <span className="text-indigo-600 font-medium">音声を再生</span>
              </button>
            </>
          )}

          <div className="flex flex-wrap gap-2">
            {question.words?.map((word, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!showAnswer) {
                    const newOrderedWords = [...orderedWords];
                    newOrderedWords.push(word);
                    setOrderedWords(newOrderedWords);
                  }
                }}
                disabled={orderedWords.includes(word) || showAnswer}
                className={`px-4 py-2 rounded-lg border ${
                  orderedWords.includes(word)
                    ? 'bg-gray-100 border-gray-200 text-gray-400'
                    : 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                {word.text}
              </button>
            ))}
          </div>

          <div className="min-h-[60px] p-4 border-2 border-dashed border-gray-200 rounded-lg">
            {orderedWords.map((word, index) => (
              <span key={index} className="mx-1">
                {word.text}
              </span>
            ))}
          </div>

          {orderedWords.length === question.words?.length && !showAnswer && (
            <button
              onClick={checkWordOrder}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              回答を確認
            </button>
          )}

          {!showAnswer && orderedWords.length > 0 && (
            <button
              onClick={() => setOrderedWords([])}
              className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              やり直す
            </button>
          )}
        </div>
      );
    }

    return null;
  };

  if (lives === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ゲームオーバー</h2>
          <p className="text-gray-600 mb-6">スコア: {score}点</p>
          <button
            onClick={() => {
              setLives(3);
              setScore(0);
              setCurrentQuestion(0);
              setCurrentLesson(0);
              setOrderedWords([]);
            }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            もう一度挑戦する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              戻る
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{lesson.title}</h2>
              <p className="text-sm text-gray-600">総合学習</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={`h-5 w-5 ${
                    i < lives ? 'text-red-500 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">{score}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              問題 {currentQuestion + 1} / {lesson.questions.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              進捗 {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-50 rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 whitespace-pre-line">
                {question.question}
              </h3>
            </div>

            {renderQuestion()}

            {!showAnswer && question.hint && (
              <button
                onClick={() => setShowHint(true)}
                className="mt-4 text-sm text-indigo-600 hover:text-indigo-700"
              >
                ヒントを見る
              </button>
            )}

            {showHint && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">{question.hint}</p>
              </div>
            )}

            {showAnswer && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className={`flex items-center mb-4 ${
                  orderedWords.map(w => w.text).join('') === question.correct
                    ? 'text-green-800'
                    : 'text-red-800'
                }`}>
                  {orderedWords.map(w => w.text).join('') === question.correct ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span>
                    {orderedWords.map(w => w.text).join('') === question.correct
                      ? '正解です！'
                      : `不正解です。正しい答えは「${question.correct}」です。`}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{question.explanation}</p>
                <button
                  onClick={handleNext}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  次へ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}