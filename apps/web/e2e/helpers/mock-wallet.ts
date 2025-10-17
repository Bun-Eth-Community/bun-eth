import type { Page } from '@playwright/test';

/**
 * Mock contract state for testing different blockchain states
 * without requiring actual wallet connections or transactions
 */
export interface MockContractState {
  isOpen?: boolean;
  price?: string;
  cap?: string;
  weiRaised?: string;
  hasClosed?: boolean;
  isWhitelisted?: boolean;
  userBalance?: string;
  totalSupply?: string;
  [key: string]: string | boolean | undefined;
}

/**
 * Mock RPC calls to simulate different contract states
 *
 * This allows testing contract interactions without:
 * - Real wallet connections
 * - Actual transactions
 * - Blockchain time manipulation
 * - Gas costs
 *
 * @param page - Playwright page instance
 * @param state - Contract state to mock
 *
 * @example
 * ```ts
 * await mockContractCalls(page, {
 *   isOpen: true,
 *   price: '1000000000000000', // 0.001 ETH
 *   cap: '1000000000000000000000', // 1000 ETH
 *   weiRaised: '500000000000000000000', // 500 ETH
 * });
 * ```
 */
export async function mockContractCalls(page: Page, state: MockContractState) {
  await page.route('http://localhost:3002', async (route) => {
    const request = route.request();
    const postData = request.postDataJSON();

    if (postData.method === 'eth_call') {
      const data = postData.params[0].data;
      const selector = data.slice(0, 10);

      // Map function selectors to mock responses
      // Add your contract's function selectors here
      const functionMap: Record<string, string> = {
        // Example: Token contract
        '0x70a08231': toHex(state.userBalance || '0'), // balanceOf(address)
        '0x18160ddd': toHex(state.totalSupply || '1000000000000000000000'), // totalSupply()

        // Example: Sale contract
        '0xa035b1fe': toHex(state.price || '1000000000000000'), // price()
        '0x47535d7b': state.isOpen ? toHex(1) : toHex(0), // isOpen()
        '0x355274ea': toHex(state.cap || '1000000000000000000000'), // cap()
        '0x4042b66f': toHex(state.weiRaised || '0'), // weiRaised()
      };

      if (functionMap[selector]) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: postData.id,
            result: functionMap[selector],
          }),
        });
        return;
      }
    }

    // Continue with real request if not mocked
    await route.continue();
  });
}

/**
 * Convert various types to hex format for RPC responses
 */
function toHex(value: string | number | boolean): string {
  if (typeof value === 'boolean') {
    return value ? '0x1' : '0x0';
  }
  if (typeof value === 'number') {
    return `0x${value.toString(16)}`;
  }
  // Assume string is already in wei or number format
  const num = BigInt(value);
  return `0x${num.toString(16).padStart(64, '0')}`;
}

/**
 * Mock a connected wallet state
 * This simulates a user having connected their wallet
 */
export async function mockWalletConnection(page: Page, address?: string) {
  const defaultAddress = address || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

  await page.addInitScript((addr) => {
    // Mock ethereum provider
    (window as any).ethereum = {
      isMetaMask: true,
      selectedAddress: addr,
      request: async ({ method }: { method: string }) => {
        if (method === 'eth_requestAccounts') {
          return [addr];
        }
        if (method === 'eth_accounts') {
          return [addr];
        }
        return null;
      },
    };
  }, defaultAddress);
}

/**
 * Increase blockchain time for testing time-dependent contracts
 * Note: This requires cast to be installed and Anvil to be running
 */
export async function increaseTime(seconds: number) {
  const { exec } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const execAsync = promisify(exec);

  await execAsync(`cast rpc evm_increaseTime ${seconds} --rpc-url http://localhost:3002`);
  await execAsync('cast rpc evm_mine --rpc-url http://localhost:3002');
}
