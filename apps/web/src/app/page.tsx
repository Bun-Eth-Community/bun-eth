"use client";

import { WalletConnect } from "@/components/wallet-connect";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Address, Balance, FaucetButton, NetworksDropdown, BurnerWalletInfo } from "@bun-eth/components";
import { useAccount, useBlockNumber } from "wagmi";

export default function Home() {
  const { isConnected, address } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Bun-Eth Scaffold
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Build Ethereum dApps at lightning speed ⚡
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NetworksDropdown />
            <WalletConnect />
          </div>
        </div>

        {/* Burner Wallet Info */}
        <BurnerWalletInfo />

        {/* Status Card */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Wallet Status</CardTitle>
                <CardDescription>
                  Your connection to the Ethereum network
                </CardDescription>
              </div>
              {isConnected && <FaucetButton />}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isConnected && address ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Address</p>
                  <Address address={address} format="long" size="base" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Balance</p>
                  <Balance address={address} className="text-xl font-bold" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Current Block</p>
                  <p className="font-mono font-medium">
                    {blockNumber ? `#${blockNumber}` : "Loading..."}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-lg text-muted-foreground mb-4">
                  Connect your wallet to get started
                </p>
                <WalletConnect />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔥</span>
              </div>
              <CardTitle>Contract Hot Reload</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Deploy contracts and see changes instantly in your UI without refresh
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎣</span>
              </div>
              <CardTitle>Custom Hooks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Type-safe React hooks for reading, writing, and watching contracts
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🧱</span>
              </div>
              <CardTitle>Web3 Components</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pre-built components for addresses, balances, inputs, and more
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <CardTitle>Bun Runtime</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Lightning-fast builds and hot reload with Bun's native speed
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔨</span>
              </div>
              <CardTitle>Foundry Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Blazing fast Solidity compiler and testing framework
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌈</span>
              </div>
              <CardTitle>RainbowKit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Beautiful wallet connection UI with multi-wallet support
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle>🚀 Quick Start</CardTitle>
            <CardDescription>Get up and running in minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold">1.</span>
                <div>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    task dev:up
                  </code>
                  <p className="text-muted-foreground mt-1">Start Anvil node and API</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold">2.</span>
                <div>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    task contracts:deploy
                  </code>
                  <p className="text-muted-foreground mt-1">Deploy your contracts</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold">3.</span>
                <div>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    task web:dev
                  </code>
                  <p className="text-muted-foreground mt-1">Start the frontend (already running!)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
