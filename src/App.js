import React, { useState } from 'react';

export default function LeadLeakageAudit() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [firmName, setFirmName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = [
    {
      id: 'response_time',
      question: 'What is your average response time to new web leads during business hours?',
      options: [
        { value: 5, label: 'Under 5 minutes', points: 10 },
        { value: 4, label: '5-30 minutes', points: 7 },
        { value: 3, label: '30 minutes - 2 hours', points: 4 },
        { value: 2, label: '2-24 hours', points: 2 },
        { value: 1, label: 'Over 24 hours or unsure', points: 0 }
      ]
    },
    {
      id: 'after_hours',
      question: 'How do you handle leads that come in after hours (evenings/weekends)?',
      options: [
        { value: 5, label: 'Automated instant response + next-day follow-up', points: 10 },
        { value: 4, label: 'Automated response, manual follow-up Monday', points: 6 },
        { value: 3, label: 'Voicemail/contact form, respond next business day', points: 3 },
        { value: 2, label: 'No system, they wait until we see it', points: 0 }
      ]
    },
    {
      id: 'lead_volume',
      question: 'How many web leads (contact forms, calls, chats) does your firm receive per month?',
      options: [
        { value: 5, label: 'Under 20', points: 5 },
        { value: 4, label: '20-50', points: 10 },
        { value: 3, label: '50-100', points: 10 },
        { value: 2, label: '100+', points: 10 }
      ]
    },
    {
      id: 'qualification',
      question: 'Do you have a system to pre-qualify leads before they reach an attorney?',
      options: [
        { value: 5, label: 'Yes, automated qualification questions', points: 10 },
        { value: 4, label: 'Yes, intake staff manually qualify', points: 7 },
        { value: 3, label: 'Partially, inconsistent process', points: 3 },
        { value: 2, label: 'No, attorneys handle all initial calls', points: 0 }
      ]
    },
    {
      id: 'follow_up',
      question: 'How many times do you follow up with leads who don\'t respond initially?',
      options: [
        { value: 5, label: '5+ touches (calls, emails, SMS)', points: 10 },
        { value: 4, label: '3-4 touches', points: 7 },
        { value: 3, label: '1-2 touches', points: 4 },
        { value: 2, label: 'Once or never', points: 0 }
      ]
    },
    {
      id: 'tracking',
      question: 'Do you track lead source, response time, and conversion rates?',
      options: [
        { value: 5, label: 'Yes, in real-time dashboard', points: 10 },
        { value: 4, label: 'Yes, but manually in spreadsheets', points: 5 },
        { value: 3, label: 'Partially, not consistent', points: 2 },
        { value: 2, label: 'No tracking system', points: 0 }
      ]
    },
    {
      id: 'booking',
      question: 'How do leads schedule consultations with your firm?',
      options: [
        { value: 5, label: 'Self-service calendar booking 24/7', points: 10 },
        { value: 4, label: 'Staff schedules during business hours', points: 5 },
        { value: 3, label: 'Back-and-forth phone tag/email', points: 2 },
        { value: 2, label: 'No formal scheduling process', points: 0 }
      ]
    },
    {
      id: 'avg_case_value',
      question: 'What is your average settlement value for PI cases?',
      options: [
        { value: 5, label: 'Under $25k', points: 0 },
        { value: 4, label: '$25k-$75k', points: 0 },
        { value: 3, label: '$75k-$200k', points: 0 },
        { value: 2, label: '$200k+', points: 0 }
      ]
    }
  ];

  const handleAnswer = (questionId, points, value) => {
    setAnswers({ ...answers, [questionId]: { points, value } });
  };

  const calculateScore = () => {
    const totalPoints = Object.values(answers).reduce((sum, answer) => sum + answer.points, 0);
    const maxPoints = questions.slice(0, -1).reduce((sum, q) => sum + 10, 0);
    return { totalPoints, maxPoints, percentage: Math.round((totalPoints / maxPoints) * 100) };
  };

  const getLeakageEstimate = () => {
    const leadVolume = answers.lead_volume?.value || 3;
    const avgCaseValue = answers.avg_case_value?.value || 3;
    
    const monthlyLeads = leadVolume === 5 ? 15 : leadVolume === 4 ? 35 : leadVolume === 3 ? 75 : 120;
    const caseValue = avgCaseValue === 5 ? 20000 : avgCaseValue === 4 ? 50000 : avgCaseValue === 3 ? 137500 : 300000;
    
    const score = calculateScore();
    const leakageRate = score.percentage < 50 ? 0.45 : score.percentage < 70 ? 0.30 : 0.15;
    
    const lostLeads = Math.round(monthlyLeads * leakageRate);
    const conversionRate = 0.15;
    const lostClients = Math.round(lostLeads * conversionRate);
    const monthlyLoss = Math.round(lostClients * caseValue * 0.33);
    const yearlyLoss = monthlyLoss * 12;
    
    return { lostLeads, lostClients, monthlyLoss, yearlyLoss, leakageRate: Math.round(leakageRate * 100) };
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeLetter = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const getRecommendations = () => {
    const recs = [];
    
    if (answers.response_time?.points < 7) {
      recs.push({
        priority: 'CRITICAL',
        issue: 'Slow Response Time',
        impact: 'Leads contacted within 5 minutes are 21x more likely to convert',
        solution: 'Implement instant auto-response system for all web inquiries'
      });
    }
    
    if (answers.after_hours?.points < 6) {
      recs.push({
        priority: 'HIGH',
        issue: 'After-Hours Lead Loss',
        impact: '62% of PI leads submit inquiries outside business hours',
        solution: 'Deploy 24/7 automated intake that captures & qualifies leads instantly'
      });
    }
    
    if (answers.qualification?.points < 7) {
      recs.push({
        priority: 'HIGH',
        issue: 'No Lead Qualification',
        impact: 'Attorneys waste 40% of consultation time on unqualified leads',
        solution: 'Add pre-qualification questions before booking consultations'
      });
    }
    
    if (answers.follow_up?.points < 7) {
      recs.push({
        priority: 'MEDIUM',
        issue: 'Weak Follow-Up System',
        impact: '80% of sales require 5+ follow-ups, but most firms stop at 1-2',
        solution: 'Build automated 7-touch nurture sequence (email + SMS)'
      });
    }
    
    if (answers.booking?.points < 7) {
      recs.push({
        priority: 'MEDIUM',
        issue: 'Manual Scheduling Friction',
        impact: 'Phone tag causes 35% of leads to choose competitors',
        solution: 'Enable self-service calendar booking with real-time availability'
      });
    }
    
    if (answers.tracking?.points < 5) {
      recs.push({
        priority: 'LOW',
        issue: 'No Performance Tracking',
        impact: 'Can\'t optimize what you don\'t measure',
        solution: 'Implement lead intelligence dashboard for data-driven decisions'
      });
    }
    
    return recs;
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length === questions.length) {
      setIsSubmitting(true);
      
      const score = calculateScore();
      const leakage = getLeakageEstimate();
      
      const submissionData = {
        firmName,
        email,
        phone,
        response_time: questions[0].options.find(o => o.value === answers.response_time?.value)?.label || '',
        after_hours: questions[1].options.find(o => o.value === answers.after_hours?.value)?.label || '',
        lead_volume: questions[2].options.find(o => o.value === answers.lead_volume?.value)?.label || '',
        qualification: questions[3].options.find(o => o.value === answers.qualification?.value)?.label || '',
        follow_up: questions[4].options.find(o => o.value === answers.follow_up?.value)?.label || '',
        tracking: questions[5].options.find(o => o.value === answers.tracking?.value)?.label || '',
        booking: questions[6].options.find(o => o.value === answers.booking?.value)?.label || '',
        avg_case_value: questions[7].options.find(o => o.value === answers.avg_case_value?.value)?.label || '',
        score: score.percentage,
        leakageRate: leakage.leakageRate,
        monthlyLoss: leakage.monthlyLoss,
        yearlyLoss: leakage.yearlyLoss
      };
      
      try {
        await fetch('https://script.google.com/macros/s/AKfycbw76ALBi0j4jsrENWNQlBER6zBefaMNec0AA1TjSfsY2EprAgY3peOt2oH0ifr_YAIk/exec', {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData)
        });
      } catch (error) {
        console.log('Submission recorded');
      }
      
      setIsSubmitting(false);
      setShowResults(true);
    }
  };

  if (showResults) {
    const score = calculateScore();
    const leakage = getLeakageEstimate();
    const recommendations = getRecommendations();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Lead Leakage Audit Results</h1>
              {firmName && <p className="text-lg text-slate-600">{firmName}</p>}
            </div>
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-8 text-white mb-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className={`text-7xl font-bold mb-2 ${getGradeColor(score.percentage)}`}>
                    {getGradeLetter(score.percentage)}
                  </div>
                  <div className="text-2xl font-semibold">{score.percentage}% Efficiency Score</div>
                  <div className="text-slate-300 mt-2">{score.totalPoints} out of {score.maxPoints} points</div>
                </div>
                
                <div className="border-l border-slate-700 pl-8">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-semibold">Estimated Lead Leakage</span>
                    </div>
                    <div className="text-4xl font-bold text-red-400">{leakage.leakageRate}%</div>
                    <div className="text-slate-300 mt-1">{leakage.lostLeads} leads lost per month</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-red-900">Monthly Revenue Loss</h3>
                </div>
                <div className="text-3xl font-bold text-red-600">
                  ${leakage.monthlyLoss.toLocaleString()}
                </div>
                <p className="text-sm text-red-700 mt-2">
                  From {leakage.lostClients} lost clients per month
                </p>
              </div>
              
              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-orange-900">Annual Revenue Loss</h3>
                </div>
                <div className="text-3xl font-bold text-orange-600">
                  ${leakage.yearlyLoss.toLocaleString()}
                </div>
                <p className="text-sm text-orange-700 mt-2">
                  Projected based on current leakage rate
                </p>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Recommended Actions</h2>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                    <div className="flex items-start gap-3">
                      <div className={`px-2 py-1 rounded text-xs font-bold ${
                        rec.priority === 'CRITICAL' ? 'bg-red-600 text-white' :
                        rec.priority === 'HIGH' ? 'bg-orange-600 text-white' :
                        'bg-yellow-600 text-white'
                      }`}>
                        {rec.priority}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{rec.issue}</h3>
                        <p className="text-sm text-slate-700 mb-2"><strong>Impact:</strong> {rec.impact}</p>
                        <p className="text-sm text-blue-800"><strong>Solution:</strong> {rec.solution}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-green-900 mb-4">3 Quick Wins You Can Implement Today</h3>
              <ol className="space-y-3 text-slate-700">
                <li className="flex gap-3">
                  <span className="font-bold text-green-600">1.</span>
                  <span>Set up email/SMS auto-responder that replies within 60 seconds to all web form submissions</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-green-600">2.</span>
                  <span>Add 3 pre-qualification questions to your contact form (injury type, timeline, current attorney)</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-green-600">3.</span>
                  <span>Create a weekend/evening voicemail that sets clear response time expectations</span>
                </li>
              </ol>
            </div>
            
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold mb-3">Want to Fix These Leaks Automatically?</h3>
              <p className="text-lg mb-6 text-blue-100">
                We help PI firms capture 98% of leads with 24/7 automated intake systems.
              </p>
              <div className="space-y-2 text-blue-100 mb-6">
                <p>✓ Responds to leads instantly, day or night</p>
                <p>✓ Pre-qualifies based on your case criteria</p>
                <p>✓ Books consultations directly into your calendar</p>
              </div>
              <p className="text-xl font-semibold">
                Book a 10-minute strategy call to see how this works for your firm
              </p>
            </div>
          </div>
          
          <div className="text-center text-slate-600 text-sm">
            <p>This audit is for informational purposes. Results are estimates based on industry benchmarks.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[step - 1];
  const progress = (step / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">PI Firm Lead Leakage Audit</h1>
            <p className="text-slate-600">Discover how many high-value leads are slipping through the cracks</p>
          </div>
          
          {step === 1 && Object.keys(answers).length === 0 && (
            <div className="mb-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Firm Name (Optional)
                </label>
                <input
                  type="text"
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your firm name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address (Optional - to receive your results)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          )}
          
          <div className="mb-8">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Question {step} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              {currentQuestion.question}
            </h2>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    handleAnswer(currentQuestion.id, option.points, option.value);
                    if (step < questions.length) {
                      setTimeout(() => setStep(step + 1), 200);
                    }
                  }}
                  className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all ${
                    answers[currentQuestion.id]?.value === option.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-slate-900">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Back
            </button>
            
            {step === questions.length && Object.keys(answers).length === questions.length && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'See Results →'}
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-6 text-center text-slate-600 text-sm">
          <p>🔒 Your information is confidential and will never be shared</p>
        </div>
      </div>
    </div>
  );
}
