type SpaceExecutionData = Pick<Space, 'executors' | 'executors_types'>;
type ExecutorType = Parameters<typeof getEvmExecutionData>[0];

import { getEvmExecutionData } from '@snapshot-labs/sx';
import {
  RELAYER_AUTHENTICATORS,
  SUPPORTED_AUTHENTICATORS,
  SUPPORTED_STRATEGIES,
  SUPPORTED_EXECUTORS
} from './constants';
import type { MetaTransaction } from '@snapshot-labs/sx/dist/utils/encoding/execution-hash';
import type { Space } from '@/types';

export function getExecution(space: SpaceExecutionData, transactions: MetaTransaction[]) {
  const supportedExecutionIndex = space.executors_types.findIndex(
    executorType => SUPPORTED_EXECUTORS[executorType]
  );

  if (supportedExecutionIndex === -1) {
    throw new Error('No supported executor configured for this space');
  }

  const executor = space.executors[supportedExecutionIndex];
  const executorType = space.executors_types[supportedExecutionIndex] as ExecutorType;
  const executionData = getEvmExecutionData(executorType, executor, {
    transactions
  });

  return {
    executor,
    executionData
  };
}

export function pickAuthenticatorAndStrategies(authenticators: string[], strategies: string[]) {
  const supportedAuthenticators = authenticators.filter(
    authenticator => SUPPORTED_AUTHENTICATORS[authenticator]
  );

  const authenticator =
    supportedAuthenticators.find(authenticator => RELAYER_AUTHENTICATORS[authenticator]) ||
    supportedAuthenticators[0];

  const selectedStrategies = strategies
    .map((strategy, index) => ({ address: strategy, index } as const))
    .filter(({ address }) => SUPPORTED_STRATEGIES[address]);

  if (!authenticator || (strategies.length !== 0 && selectedStrategies.length === 0)) {
    throw new Error('Unsupported space');
  }

  return {
    useRelayer: !!RELAYER_AUTHENTICATORS[authenticator],
    authenticator,
    strategies: selectedStrategies
  };
}

export async function executionCall(
  baseUrl: string,
  method: 'execute' | 'executeQueuedProposal',
  params: any
) {
  const res = await fetch(`${baseUrl}/eth_rpc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: method,
      params,
      id: null
    })
  });

  const { error, result } = await res.json();
  if (error) throw new Error('Finalization failed');

  return result;
}