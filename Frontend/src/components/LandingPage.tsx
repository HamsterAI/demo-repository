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

import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

const LandingPage: React.FC = () => {
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
        <div className="sticky top-4 left-2 z-50 ml-4 inline-block">
          <DynamicWidget />
        </div>
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
              <button className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-3xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
                <span>Experience OmniNest Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

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
              Discover the innovative capabilities that make OmniNest the
              ultimate cross-chain RWA investment platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
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

      {/* How It Works Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              OmniNest Workflow
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              See how OmniNest transforms your investment commands into
              intelligent cross-chain actions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workflow.map((item, index) => (
              <div
                key={index}
                className={`relative group transition-all duration-500 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="p-8 rounded-3xl bg-gradient-to-br from-white/80 to-slate-50/80 backdrop-blur-sm border border-slate-200/60 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-4">
                      {item.step}
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-slate-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>

                {index < workflow.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="w-8 h-8 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why OmniNest Section */}
      <section className="py-24 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose OmniNest?
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Experience the future of cross-chain RWA investment management
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {advantages.map((advantage, index) => (
              <div
                key={index}
                className={`group p-8 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-500 transform hover:scale-105 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <advantage.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {advantage.title}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {advantage.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Investment Strategy?
          </h2>
          <p className="text-xl text-purple-100 mb-12 leading-relaxed">
            Join the future of AI-powered cross-chain RWA investment management.
            Start your smart investment journey today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="group px-10 py-5 bg-white text-purple-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
              <span>Start Your Smart RWA Investment Journey Today</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <p className="text-purple-200 mt-8 text-sm">
            Join our early access program and be among the first to experience
            the future of DeFi
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">OmniNest</span>
            </div>

            <div className="text-slate-400 text-sm">
              © 2024 OmniNest. Built for the future of cross-chain RWA
              investment.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
