import React, { useState } from 'react'
import BigNumber from 'bignumber.js'
import { Button, Flex, Heading, Text } from '@pancakeswap-libs/uikit'
import useI18n from 'hooks/useI18n'
import { useHarvest } from 'hooks/useHarvest'
import { getBalanceNumber } from 'utils/formatBalance'
import styled from 'styled-components'
import useStake from '../../../../hooks/useStake'

interface FarmCardActionsProps {
  earnings?: BigNumber
  pid?: number
  nextHarvestUntil: number
}

const BalanceAndCompound = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
`

const Label = styled.div`
  font-weight: 700;
  margin-right: 1rem;
`

const formatTimer = (duration) => {
  const d = Math.floor(duration / (3600*24));
  const h = Math.floor(duration % (3600*24) / 3600);
  const m = Math.floor(duration % 3600 / 60);
  const s = Math.floor(duration % 60);

  if (d > 0) {
    return `${d} Days ${h}:${m}:${s}`
  }

  return `${h}:${m}:${s}`
}

const HarvestAction: React.FC<FarmCardActionsProps> = ({ earnings, pid, nextHarvestUntil }) => {
  const TranslateString = useI18n()
  const [pendingTx, setPendingTx] = useState(false)
  const { onReward } = useHarvest(pid)
  const { onStake } = useStake(pid)

  const rawEarningsBalance = getBalanceNumber(earnings)
  const displayBalance = rawEarningsBalance.toLocaleString()
  const [counter, setCounter] = React.useState(nextHarvestUntil);

  React.useEffect(() => {
    const timer =
      counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
    return () => clearInterval(timer);
  }, [counter]);

  return (
    <Flex justifyContent='center' flexDirection='column'>
      <Flex mb='8px' justifyContent='space-between' alignItems='center'>
        <Heading color={rawEarningsBalance === 0 ? 'textDisabled' : 'text'}>{displayBalance}</Heading>
        <BalanceAndCompound>
          {pid === 12 ?
            <Button
              disabled={rawEarningsBalance === 0 || pendingTx}
              size='sm'
              variant='secondary'
              marginBottom='15px'
              onClick={async () => {
                setPendingTx(true)
                await onStake(rawEarningsBalance.toString())
                setPendingTx(false)
              }}
            >
              {TranslateString(999, 'Compound')}
            </Button>
            : null}
          <Button
            disabled={rawEarningsBalance === 0 || pendingTx || nextHarvestUntil > 0}
            onClick={async () => {
              setPendingTx(true)
              await onReward()
              setPendingTx(false)
            }}
          >
            {TranslateString(999, 'Harvest')}
          </Button>
        </BalanceAndCompound>
      </Flex>
      {false ?
        <Flex alignItems='center' justifyContent='space-between'>
          <Text color='primary'>Locked until:</Text>
          <Text>{formatTimer(counter)}</Text>

        </Flex> : null}
    </Flex>
  )
}

export default HarvestAction
