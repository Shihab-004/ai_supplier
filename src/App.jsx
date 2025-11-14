import React, { useState, useRef, useEffect } from 'react';
import { Upload, Send, FileSpreadsheet, Loader2, Sparkles, TrendingUp, Zap, Database } from 'lucide-react';

export default function SupplierSelectionApp() {
  const [apiKey, setApiKey] = useState('');
  const [csvData, setCsvData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        setCsvData(text);
        setMessages([{
          role: 'assistant',
          content: `✨ CSV ফাইল "${file.name}" সফলভাবে লোড হয়েছে!\n\nআপনি এখন প্রশ্ন করতে পারেন:\n• "টপ 5 সাপ্লায়ার দেখাও"\n• "কম দামে ভালো কোয়ালিটির 3 টা সাপ্লায়ার"\n• "Dhaka এর সেরা সাপ্লায়ার কারা?"\n• "OEKO-TEX সার্টিফাইড সাপ্লায়ার"`
        }]);
      };
      reader.readAsText(file);
    }
  };

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }
    return data;
  };

  const calculateScore = (supplier) => {
    const price = parseFloat(supplier['Price per meter (USD)']) || 0;
    const leadTime = parseInt(supplier['Lead Time days']) || 0;
    const quality = parseInt(supplier['Quality Rating']) || 0;
    const reliability = parseInt(supplier['Reliability (%)']) || 0;
    const financial = parseInt(supplier['Financial Stability']) || 0;
    const communication = parseInt(supplier['Communication Score']) || 0;
    const pastPerf = parseInt(supplier['Past Performance']) || 0;
    
    const priceScore = (4 - price) * 2.5;
    const leadScore = (20 - leadTime) * 0.5;
    const qualityScore = quality * 1.5;
    const reliabilityScore = reliability * 0.1;
    const financialScore = financial * 1.2;
    const commScore = communication * 1.0;
    const pastScore = pastPerf * 1.3;
    const sustainScore = supplier['Sustainability Compliance'] !== 'None' ? 5 : 0;
    
    return priceScore + leadScore + qualityScore + reliabilityScore + 
           financialScore + commScore + pastScore + sustainScore;
  };

  const analyzeSuppliers = (suppliers, userQuery) => {
    const query = userQuery.toLowerCase();
    let filtered = [...suppliers];
    
    if (query.includes('dhaka')) {
      filtered = filtered.filter(s => s.Location.toLowerCase().includes('dhaka'));
    }
    if (query.includes('chittagong')) {
      filtered = filtered.filter(s => s.Location.toLowerCase().includes('chittagong'));
    }
    if (query.includes('oeko-tex')) {
      filtered = filtered.filter(s => s['Sustainability Compliance'].includes('OEKO-TEX'));
    }
    if (query.includes('bsci')) {
      filtered = filtered.filter(s => s['Sustainability Compliance'].includes('BSCI'));
    }
    if (query.includes('iso')) {
      filtered = filtered.filter(s => s['Sustainability Compliance'].includes('ISO'));
    }
    if (query.includes('কম দাম') || query.includes('low price') || query.includes('cheap')) {
      filtered.sort((a, b) => parseFloat(a['Price per meter (USD)']) - parseFloat(b['Price per meter (USD)']));
    }
    if (query.includes('quality') || query.includes('কোয়ালিটি')) {
      filtered = filtered.filter(s => parseInt(s['Quality Rating']) >= 8);
    }
    
    const withScores = filtered.map(s => ({
      ...s,
      calculatedScore: calculateScore(s)
    }));
    
    withScores.sort((a, b) => b.calculatedScore - a.calculatedScore);
    
    let topN = 5;
    if (query.includes('top 3') || query.includes('টপ 3') || query.includes('3 টা')) {
      topN = 3;
    } else if (query.includes('top 10') || query.includes('টপ 10')) {
      topN = 10;
    }
    
    return withScores.slice(0, topN);
  };

  const formatResponse = (topSuppliers) => {
    let response = `🏆 **সেরা ${topSuppliers.length} টি সাপ্লায়ার**\n\n`;
    
    topSuppliers.forEach((s, idx) => {
      response += `**${idx + 1}. ${s['Supplier Name']}** 📍 ${s.Location}\n`;
      response += `💰 Price: $${s['Price per meter (USD)']} | ⏱️ Lead: ${s['Lead Time days']} days\n`;
      response += `⭐ Quality: ${s['Quality Rating']}/10 | 📊 Reliability: ${s['Reliability (%)']}%\n`;
      response += `💼 Financial: ${s['Financial Stability']}/10 | 🌱 ${s['Sustainability Compliance']}\n`;
      response += `🎯 Score: ${s.calculatedScore.toFixed(2)}\n\n`;
    });
    
    response += `✅ **Why These Suppliers?**\n`;
    response += `• Optimal price-quality balance\n`;
    response += `• Fast lead time & high reliability\n`;
    response += `• Strong sustainability compliance\n`;
    
    return response;
  };

  const sendMessage = async () => {
    if (!input.trim() || !csvData) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const suppliers = parseCSV(csvData);
      const topSuppliers = analyzeSuppliers(suppliers, currentInput);
      const response = formatResponse(topSuppliers);
      
      if (apiKey) {
        try {
          const prompt = `You are an expert RMG supplier analyst. Based on these suppliers, provide a brief analysis in Bengali (2-3 sentences):

${JSON.stringify(topSuppliers.slice(0, 3), null, 2)}

User asked: ${currentInput}

Be conversational and helpful.`;

          const aiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
              })
            }
          );

          const aiData = await aiResponse.json();
          
          if (aiData.candidates && aiData.candidates[0]) {
            const aiText = aiData.candidates[0].content.parts[0].text;
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: response + `\n\n💡 **AI Insight:**\n${aiText}`
            }]);
          } else {
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
          }
        } catch (apiError) {
          setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      }
      
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ Error: ${error.message}`
      }]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Header */}
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-6 py-2 mb-4">
            <Sparkles className="text-purple-300" size={20} />
            <span className="text-purple-200 text-sm font-medium">Powered by AI</span>
          </div>
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-3">
            Selectly
          </h1>
          <p className="text-2xl text-purple-200 font-light tracking-wide">
            AI-Powered Supplier Selection And Data Analysis
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-purple-300">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-yellow-400" />
              <span>Instant Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green-400" />
              <span>Smart Ranking</span>
            </div>
            <div className="flex items-center gap-2">
              <Database size={16} className="text-blue-400" />
              <span>CSV Support</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/20 overflow-hidden">
          {/* API Key Section */}
          <div className="p-6 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-b border-purple-500/20">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="text-purple-400" size={24} />
              <h3 className="font-bold text-white text-lg">AI Enhancement (Optional)</h3>
            </div>
            <input
              type="password"
              placeholder="🔑 Enter Gemini API Key for enhanced AI insights..."
              value={apiKey}
              className="w-full px-5 py-3 bg-slate-900/50 border border-purple-500/30 rounded-xl text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-purple-300/70 mt-2">
              Get free key: <a href="https://makersuite.google.com/app/apikey" target="_blank" className="text-purple-400 underline hover:text-purple-300">Google AI Studio</a>
              {' '} • Works perfectly without API key!
            </p>
          </div>

          {/* File Upload */}
          <div className="p-6 border-b border-purple-500/20">
            <label className="group relative flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl cursor-pointer hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg hover:shadow-purple-500/50 overflow-hidden">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <Upload size={24} className="relative z-10" />
              <span className="font-bold text-lg relative z-10">
                {fileName || '📂 Upload CSV File'}
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {fileName && (
              <div className="mt-4 flex items-center gap-3 text-green-400 bg-green-500/10 border border-green-500/30 px-5 py-3 rounded-xl">
                <FileSpreadsheet size={20} />
                <span className="font-medium">{fileName}</span>
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-900/50 to-slate-900/80">
            {messages.length === 0 && (
              <div className="text-center text-purple-300/50 mt-32">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-purple-500/10 border-2 border-purple-500/20 mb-6">
                  <FileSpreadsheet size={48} />
                </div>
                <p className="text-2xl font-bold mb-2">Ready to Analyze</p>
                <p className="text-sm">Upload your CSV to unlock intelligent supplier insights</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-3xl px-6 py-4 rounded-2xl shadow-xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gradient-to-br from-slate-800 to-slate-900 text-purple-100 border border-purple-500/30'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/30 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
                  <Loader2 className="animate-spin text-purple-400" size={24} />
                  <span className="text-purple-200 font-medium">Analyzing suppliers...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-gradient-to-r from-slate-900/90 to-slate-800/90 border-t border-purple-500/20">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
                placeholder={
                  !csvData ? '⚡ Upload CSV first...' :
                  '💬 Ask anything... (e.g., "টপ 5 সাপ্লায়ার দেখাও")'
                }
                disabled={!csvData || loading}
                className="flex-1 px-6 py-4 bg-slate-900/50 border border-purple-500/30 rounded-xl text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 transition-all"
              />
              <button
                onClick={sendMessage}
                disabled={!csvData || !input.trim() || loading}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-purple-500/50 flex items-center gap-2 font-bold"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Guide */}
        <div className="mt-8 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
          <h3 className="font-bold text-white text-xl mb-4 flex items-center gap-2">
            <Sparkles className="text-purple-400" size={24} />
            Quick Start Guide
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-purple-500/20">
              <p className="text-purple-300 font-semibold mb-2">📝 Example Questions:</p>
              <ul className="text-purple-200/80 text-sm space-y-1">
                <li>• "টপ 5 সাপ্লায়ার দেখাও"</li>
                <li>• "কম দামে ভালো কোয়ালিটির 3 টা"</li>
                <li>• "OEKO-TEX certified suppliers"</li>
                <li>• "Dhaka location best suppliers"</li>
              </ul>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-purple-500/20">
              <p className="text-purple-300 font-semibold mb-2">🎯 Smart Features:</p>
              <ul className="text-purple-200/80 text-sm space-y-1">
                <li>✓ Location-based filtering</li>
                <li>✓ Certification search (ISO, BSCI, etc.)</li>
                <li>✓ Price-quality optimization</li>
                <li>✓ Multi-criteria ranking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}