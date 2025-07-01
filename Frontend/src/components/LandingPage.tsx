import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Link,
  Brain,
  BarChart3,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  Users,
  ChevronRight,
  Sparkles,
  Globe,
  Wallet,
} from "lucide-react";

interface LandingPageProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ isLoggedIn, onLoginClick }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: MessageSquare,
      title: "Intuitive Natural Language Commands",
      description:
        "Simply type commands like 'Allocate 30% of my portfolio into high-yield RWA on Solana,' and OmniNest will parse your intent, calculate the allocation, and initiate the transaction.",
      gradient: "from-purple-500 to-blue-500",
    },
    {
      icon: Link,
      title: "Cross-Chain Interoperability via Chainlink CCIP",
      description:
        "Leveraging Chainlink's Cross-Chain Interoperability Protocol (CCIP), funds move securely and efficiently between blockchains (e.g., Ethereum ↔ Solana) with unparalleled ease.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Brain,
      title: "ElizaOS: Intelligent RWA Investment Strategies",
      description:
        "Our AI engine, ElizaOS, deeply analyzes platforms like Maple Finance, intelligently selecting optimal RWA pools (e.g., APY ≥ 8%) based on risk, yield, and duration.",
      gradient: "from-cyan-500 to-teal-500",
    },
    {
      icon: BarChart3,
      title: "Automated Weekly Yield Reports & Smart Rebalancing",
      description:
        "Receive concise investment summaries and AI-powered insights regularly. When yield drops, the AI proactively suggests reallocation strategies to optimize your portfolio.",
      gradient: "from-teal-500 to-green-500",
    },
  ];

  const workflow = [
    {
      step: "01",
      title: "Input Command",
      description: "Invest 30% in Solana RWA",
      icon: MessageSquare,
    },
    {
      step: "02",
      title: "AI Parses Intent",
      description: "Portfolio = $6,500 → 30% = $1,950",
      icon: Brain,
    },
    {
      step: "03",
      title: "Cross-Chain Transfer",
      description: "Move USDC to Solana",
      icon: Link,
    },
    {
      step: "04",
      title: "RWA Pool Scan",
      description: "Find APY ≥ 8% on Maple",
      icon: TrendingUp,
    },
    {
      step: "05",
      title: "Invest & Notify",
      description: "Allocate funds, push notification",
      icon: Zap,
    },
    {
      step: "06",
      title: "Monitor & Rebalance",
      description: "Weekly reports + suggestions",
      icon: BarChart3,
    },
  ];

  const advantages = [
    {
      icon: Sparkles,
      title: "True AI + DeFi Fusion",
      description:
        "Seamlessly integrates cutting-edge artificial intelligence with decentralized finance for an unparalleled investment experience.",
    },
    {
      icon: Globe,
      title: "Real Interoperability",
      description:
        "Breaks down blockchain barriers, enabling free flow and management of assets across multiple chains.",
    },
    {
      icon: Shield,
      title: "Stable, Yield-Bearing Assets",
      description:
        "Focuses on Real World Assets (RWA) to provide stable and attractive yield opportunities.",
    },
    {
      icon: Users,
      title: "User-Friendly, No Technical Jargon Needed",
      description:
        "Say goodbye to complex blockchain operations; manage your digital assets effortlessly through intuitive natural language.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* 只在未连接时显示Connect Wallet按钮 */}
        {!isLoggedIn && (
          <div className="sticky top-4 left-2 z-50 ml-4 inline-block">
            <button
              onClick={onLoginClick}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            >
              Connect Wallet
            </button>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-cyan-600/10"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div
            className={`text-center transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Wallet className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                OmniNest
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-700 mb-4 font-medium">
              AI-Powered Cross-Chain RWA Investment Manager
            </p>

            <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Your Autonomous On-Chain Financial Co-Pilot, Seamlessly Bridging
              DeFi and Real World Asset Investments with Natural Language
              Commands.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isLoggedIn ? (
                <button 
                  onClick={() => window.location.href = '#chat'}
                  className="group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-3xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                >
                  <span>Start Investing</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button 
                  onClick={onLoginClick}
                  className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-3xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              <button className="px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-700 rounded-2xl font-semibold text-lg border border-slate-200 hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
        <div
          className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-to-r from-teal-400 to-green-400 rounded-full opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </section>

      {/* Key Features Section */}
      <section className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Experience the future of AI-powered cross-chain investment management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From natural language command to executed investment in seconds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workflow.map((step, index) => (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-purple-600">
                    {step.step}
                  </span>
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-600 text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Why Choose OmniNest
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              The advantages that set us apart in the DeFi landscape
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {advantages.map((advantage, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <advantage.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {advantage.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {advantage.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Ready to Start Your AI Investment Journey?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Join thousands of users who are already experiencing the future of DeFi
          </p>
          {isLoggedIn ? (
            <button 
              onClick={() => window.location.href = '#chat'}
              className="group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-3xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
            >
              <span>Start Investing</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button 
              onClick={onLoginClick}
              className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-3xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
