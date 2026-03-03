'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  getIntent, 
  getPendingApprovals, 
  getProposals, 
  getOutcomes,
  getReflections 
} from '@/lib/api';
import { formatPercent } from '@/lib/utils';
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Play,
  Settings,
  History,
  Brain,
  ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const { data: intent } = useQuery({
    queryKey: ['intent'],
    queryFn: getIntent,
  });

  const { data: pendingApprovals } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: getPendingApprovals,
  });

  const { data: proposals } = useQuery({
    queryKey: ['proposals'],
    queryFn: getProposals,
  });

  const { data: outcomes } = useQuery({
    queryKey: ['outcomes'],
    queryFn: getOutcomes,
  });

  const { data: reflections } = useQuery({
    queryKey: ['reflections'],
    queryFn: getReflections,
  });

  const recentProposals = proposals?.slice(0, 5) || [];
  const pendingCount = pendingApprovals?.length || 0;
  const totalTrades = outcomes?.length || 0;
  const latestReflection = reflections?.[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Stock Trading Agent</h1>
            </div>
            <nav className="flex gap-4">
              <Link 
                href="/decisions" 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Play className="w-4 h-4" />
                运行决策
              </Link>
              <Link 
                href="/intent" 
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                配置
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Pending Approvals */}
          <Link href="/approvals" className="block">
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">待审批交易</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{pendingCount}</p>
                </div>
                <AlertCircle className={`w-10 h-10 ${pendingCount > 0 ? 'text-yellow-500' : 'text-gray-300'}`} />
              </div>
              <p className="text-sm text-gray-500 mt-2">点击查看详情 →</p>
            </div>
          </Link>

          {/* Total Trades */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总交易数</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalTrades}</p>
              </div>
              <History className="w-10 h-10 text-blue-500" />
            </div>
            <Link href="/history" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
              查看历史 →
            </Link>
          </div>

          {/* Win Rate */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">胜率</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {latestReflection ? `${(latestReflection.performanceMetrics.winRate * 100).toFixed(1)}%` : '--'}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              基于 {latestReflection?.performanceMetrics.totalTrades || 0} 笔交易
            </p>
          </div>

          {/* Avg Return */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均收益</p>
                <p className={`text-3xl font-bold mt-2 ${
                  (latestReflection?.performanceMetrics.averageReturn || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {latestReflection ? formatPercent(latestReflection.performanceMetrics.averageReturn) : '--'}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-500" />
            </div>
            <Link href="/reflection" className="text-sm text-purple-600 hover:underline mt-2 inline-block">
              查看反思 →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Proposals */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">近期交易提议</h2>
                <Link href="/proposals" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  查看全部 <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="divide-y">
                {recentProposals.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    暂无交易提议
                  </div>
                ) : (
                  recentProposals.map((proposal) => (
                    <Link key={proposal.id} href={`/proposals/${proposal.id}`}>
                      <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                              proposal.action === 'BUY' ? 'bg-green-500' : 
                              proposal.action === 'SELL' ? 'bg-red-500' : 'bg-blue-500'
                            }`}>
                              {proposal.action[0]}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{proposal.symbol}</p>
                              <p className="text-sm text-gray-500">{proposal.thesis}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{proposal.sizePercent}%</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              proposal.requiresApproval ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {proposal.requiresApproval ? '需审批' : '已执行'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Intent Summary */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h2>
              <div className="space-y-3">
                <Link 
                  href="/decisions"
                  className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  <span className="font-medium">发起新交易</span>
                </Link>
                <Link 
                  href="/approvals"
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    pendingCount > 0 
                      ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' 
                      : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">审批交易 {pendingCount > 0 && `(${pendingCount})`}</span>
                </Link>
                <Link 
                  href="/reflection"
                  className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                >
                  <Brain className="w-5 h-5" />
                  <span className="font-medium">运行反思分析</span>
                </Link>
              </div>
            </div>

            {/* Intent Summary */}
            {intent && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">当前配置</h2>
                  <Link href="/intent" className="text-sm text-blue-600 hover:underline">编辑</Link>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">风险承受度</span>
                    <span className="font-medium">{(intent.riskTolerance * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">策略风格</span>
                    <span className="font-medium">{intent.style}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">持仓周期</span>
                    <span className="font-medium">{intent.holdingHorizonDays} 天</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">偏好市值</span>
                    <span className="font-medium">{intent.preferredMarketCaps.join(', ')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
