import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'
import 'feather-icons'
import styled from 'styled-components'
import Panel from '../components/Panel'
import {
  PageWrapper,
  ContentWrapperLarge,
  StyledPairInformationBlock,
  StyledPlusIcon,
  StyledBookmarkIcon
} from '../components/index'
import { AutoRow, RowBetween, RowFixed } from '../components/Row'
import Column, { AutoColumn } from '../components/Column'
import { ButtonLight, ButtonDark } from '../components/ButtonStyled'
import PairChart from '../components/PairChart'
import Link from '../components/Link'
import TxnList from '../components/TxnList'
import Loader from '../components/LocalLoader'
import { BasicLink } from '../components/Link'
import Search from '../components/Search'
import { formattedNum, formattedPercent, getPoolLink, getSwapLink } from '../utils'
import { useColor } from '../hooks'
import { usePairData, usePairTransactions } from '../contexts/PairData'
import { TYPE, ThemedBackground } from '../Theme'
import { transparentize } from 'polished'
import CopyHelper from '../components/Copy'
import { useMedia } from 'react-use'
import DoubleTokenLogo from '../components/DoubleLogo'
import TokenLogo from '../components/TokenLogo'
import { Hover } from '../components'
import { useEthPrice } from '../contexts/GlobalData'
import Warning from '../components/Warning'
import { usePathDismissed } from '../contexts/LocalStorage'

// import { Bookmark, PlusCircle } from 'react-feather'
import FormattedName from '../components/FormattedName'
import { useListedTokens } from '../contexts/Application'
import { BookmarkIcon, BorderedPlusIcon, ChevronMenuIcon, PlusIcon } from '../svg'
import { Flex } from 'rebass'
import { SavedInfo } from '../components/SavedInfo'

const DashboardWrapper = styled.div`
  width: 100%;
`

const PanelWrapper = styled.div`
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: max-content;
  gap: 16px;
  grid-column-gap: 30px;
  display: inline-grid;
  width: 100%;
  align-items: start;
  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    > * {
      grid-column: 1 / 4;
    }

    > * {
      &:first-child {
        width: 100%;
      }
    }
  }
`

const TokenDetailsLayout = styled.div`
  display: flex;
  flex-direction: column;
`

const FixedPanel = styled(Panel)`
  width: fit-content;
  padding: 6px 12px;
  border-radius: 6px;

  :hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg2};
  }
`

const HoverSpan = styled.span`
  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

const WarningGrouping = styled.div`
  opacity: ${({ disabled }) => disabled && '0.4'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
`

const StyledPageWrapper = styled(PageWrapper)`
  padding-top: 24px;
  // padding-top: 0;
`

const StyledPair = styled.div`
  display: inline-block;
  background: rgba(108, 93, 211, 0.1);
  border-radius: 6px;
  padding: 4px 8px;
  color: #8990A5;
  fontSize: 12px;
`

const StyledPairContainer = styled.div`
  > * {
    color: #0B1359;
  }
`

const StyledCard = styled.div`
  background: #FFFFFF;
  box-shadow: 0px 6px 12px rgba(185, 189, 208, 0.4);
  border-radius: 6px;
  padding: 24px;
  box-sizing: border-box;
  height: 122px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const StyledButtonLight = styled(ButtonLight)`
  display: flex;
  align-items: center;
  user-select: none;
  
  > svg {
    margin-right: 16px;
  }
`

function PairPage({ pairAddress, history }) {
  const {
    token0,
    token1,
    reserve0,
    reserve1,
    reserveUSD,
    trackedReserveUSD,
    oneDayVolumeUSD,
    volumeChangeUSD,
    oneDayVolumeUntracked,
    volumeChangeUntracked,
    liquidityChangeUSD,
  } = usePairData(pairAddress)

  useEffect(() => {
    document.querySelector('body').scrollTo(0, 0)
  }, [])

  const transactions = usePairTransactions(pairAddress)
  const backgroundColor = useColor(pairAddress)

  // liquidity
  const liquidity = trackedReserveUSD
    ? formattedNum(trackedReserveUSD, true)
    : reserveUSD
    ? formattedNum(reserveUSD, true)
    : '-'
  const liquidityChange = formattedPercent(liquidityChangeUSD)

  // mark if using untracked liquidity
  const [usingTracked, setUsingTracked] = useState(true)
  useEffect(() => {
    setUsingTracked(!trackedReserveUSD ? false : true)
  }, [trackedReserveUSD])

  // volume	  // volume
  const volume =
    oneDayVolumeUSD || oneDayVolumeUSD === 0
      ? formattedNum(oneDayVolumeUSD === 0 ? oneDayVolumeUntracked : oneDayVolumeUSD, true)
      : oneDayVolumeUSD === 0
      ? '$0'
      : '-'

  // mark if using untracked volume
  const [usingUtVolume, setUsingUtVolume] = useState(false)
  useEffect(() => {
    setUsingUtVolume(oneDayVolumeUSD === 0 ? true : false)
  }, [oneDayVolumeUSD])

  const volumeChange = formattedPercent(!usingUtVolume ? volumeChangeUSD : volumeChangeUntracked)

  // get fees	  // get fees
  const fees =
    oneDayVolumeUSD || oneDayVolumeUSD === 0
      ? usingUtVolume
        ? formattedNum(oneDayVolumeUntracked * 0.002, true)
        : formattedNum(oneDayVolumeUSD * 0.002, true)
      : '-'

  // token data for usd
  const [ethPrice] = useEthPrice()
  const token0USD =
    token0?.derivedETH && ethPrice ? formattedNum(parseFloat(token0.derivedETH) * parseFloat(ethPrice), true) : ''

  const token1USD =
    token1?.derivedETH && ethPrice ? formattedNum(parseFloat(token1.derivedETH) * parseFloat(ethPrice), true) : ''

  // rates
  const token0Rate = reserve0 && reserve1 ? formattedNum(reserve1 / reserve0) : '-'
  const token1Rate = reserve0 && reserve1 ? formattedNum(reserve0 / reserve1) : '-'

  // formatted symbols for overflow
  const formattedSymbol0 = token0?.symbol.length > 6 ? token0?.symbol.slice(0, 5) + '...' : token0?.symbol
  const formattedSymbol1 = token1?.symbol.length > 6 ? token1?.symbol.slice(0, 5) + '...' : token1?.symbol

  const below1080 = useMedia('(max-width: 1080px)')
  const below900 = useMedia('(max-width: 900px)')
  const below600 = useMedia('(max-width: 600px)')

  const [dismissed, markAsDismissed] = usePathDismissed(history.location.pathname)
  const [isSaved, setIsSaved] = useState(window.localStorage.getItem('pinnedInfo') ? JSON.parse(window.localStorage.getItem('pinnedInfo')).pairs.find((pair)=>pair.address === pairAddress) : false)

  useEffect(() => {
    window.scrollTo({
      behavior: 'smooth',
      top: 0,
    })
  }, [])

  // const [savedPairs, addPair] = useSavedPairs()

  const listedTokens = useListedTokens()

  const onClickHandler = () => {
    if(window.localStorage.getItem('pinnedInfo')) {
      let result = JSON.parse(window.localStorage.getItem('pinnedInfo'))
      if(!result.pairs.find((pair)=>pair.address === pairAddress))
        result.pairs.push({ address: pairAddress, address1: token0?.id, address2: token1?.id, symbol1: token0?.symbol, symbol2: token1?.symbol })
      window.localStorage.setItem('pinnedInfo', JSON.stringify(Object.assign(JSON.parse(window.localStorage.getItem('pinnedInfo')), result)))
    }
    else
      window.localStorage.setItem('pinnedInfo', JSON.stringify({tokens: [], pairs: [{ address: pairAddress, address1: token0?.id, address2: token1?.id, symbol1: token0?.symbol, symbol2: token1?.symbol }]}))
    setIsSaved(true);
  }

  const onBookmarkClickHandler = () => {
    let result = JSON.parse(window.localStorage.getItem('pinnedInfo'))
    result.pairs.splice(result.pairs.findIndex((pair)=>pair.address === pairAddress), 1)
    window.localStorage.setItem('pinnedInfo', JSON.stringify(Object.assign(JSON.parse(window.localStorage.getItem('pinnedInfo')), result)))
    setIsSaved(false);
  }

  return (
    <StyledPageWrapper>
      <ThemedBackground backgroundColor={transparentize(0.6, backgroundColor)} />
      <span />
      <Warning
        type={'pair'}
        show={!dismissed && listedTokens && !(listedTokens.includes(token0?.id) && listedTokens.includes(token1?.id))}
        setShow={markAsDismissed}
        address={pairAddress}
      />
      <ContentWrapperLarge>
        <RowBetween>
          <TYPE.body style={{display: 'flex', alignItems: 'center'}}>
            <BasicLink to="/pairs"
                       style={{background: 'rgba(108, 93, 211, 0.1)', borderRadius: '6px', padding: '4px 8px', height: 'auto', color: '#8990A5', fontSize: '12px'}}>
              {'Pairs '}</BasicLink><ChevronMenuIcon style={{transform: 'rotate(180deg)', padding: '0 4px'}}/><StyledPair>{token0?.symbol}-{token1?.symbol}</StyledPair>
          </TYPE.body>
          {!below600 &&
            <Flex flexBasis="45%" alignItems="center">
              <Search small={true} big disableMargin />  <SavedInfo ml={32} selectedAddress={pairAddress} setIsSaved={setIsSaved}/>
            </Flex>
          }
        </RowBetween>
        <WarningGrouping
          disabled={
            !dismissed && listedTokens && !(listedTokens.includes(token0?.id) && listedTokens.includes(token1?.id))
          }
        >
          <DashboardWrapper>
            <AutoColumn gap="40px" style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  width: '100%',
                }}
              >
                <RowFixed style={{ flexWrap: 'wrap', minWidth: '100px' }}>
                  <RowFixed>
                    {token0 && token1 && (
                      <DoubleTokenLogo a0={token0?.id || ''} a1={token1?.id || ''} size={48} margin={true} big />
                    )}{' '}
                    <TYPE.main fontSize={below1080 ? '2rem' : '3rem'} style={{ margin: '0 21px', fontWeight: "bold" }}>
                      {token0 && token1 ? (
                        <StyledPairContainer>
                          <HoverSpan onClick={() => history.push(`/token/${token0?.id}`)}>{token0.symbol}</HoverSpan>
                          <span>-</span>
                          <HoverSpan onClick={() => history.push(`/token/${token1?.id}`)}>
                            {token1.symbol}
                          </HoverSpan>{' '}
                          <span>Pair</span>
                        </StyledPairContainer>
                      ) : (
                        ''
                      )}
                    </TYPE.main>
                  </RowFixed>
                </RowFixed>
                <RowFixed
                  ml={below900 ? '0' : '2.5rem'}
                  mt={below1080 && '1rem'}
                  style={{
                    flexDirection: below1080 ? 'row-reverse' : 'initial',
                  }}
                >
                  {/* {!!!savedPairs[pairAddress] && !below1080 ? (
                    <Hover onClick={() => addPair(pairAddress, token0.id, token1.id, token0.symbol, token1.symbol)}>
                      <StyledIcon>
                        <PlusCircle style={{ marginRight: '0.5rem' }} />
                      </StyledIcon>
                    </Hover>
                  ) : !below1080 ? (
                    <StyledIcon>
                      <Bookmark style={{ marginRight: '0.5rem', opacity: 0.4 }} />
                    </StyledIcon>
                  ) : (
                    <></>
                  )} */}
                  {!isSaved ? <StyledPlusIcon onClick={onClickHandler}><PlusIcon /></StyledPlusIcon>
                    : <StyledBookmarkIcon onClick={onBookmarkClickHandler}><BookmarkIcon /></StyledBookmarkIcon>
                  }
                  <StyledButtonLight color={'#6C5DD3'} style={{height: '48px'}}>
                    <Link external href={getPoolLink(token0?.id, token1?.id)} style={{display: 'flex', alignItems: 'center'}}>
                     <BorderedPlusIcon style={{marginRight: '8px'}}/> <span>Add Liquidity</span>
                    </Link>
                  </StyledButtonLight>
                  <Link external href={getSwapLink(token0?.id, token1?.id)}>
                    <ButtonDark ml={!below1080 && '.5rem'} mr={below1080 && '.5rem'} color={backgroundColor} style={{height: '48px'}}>
                      Trade
                    </ButtonDark>
                  </Link>
                </RowFixed>
              </div>
            </AutoColumn>
            <AutoRow
              gap="6px"
              style={{
                width: 'fit-content',
                marginTop: below900 ? '1rem' : '0',
                marginBottom: below900 ? '0' : '2rem',
                flexWrap: 'wrap',
              }}
            >
              <FixedPanel onClick={() => history.push(`/token/${token0?.id}`)}>
                <RowFixed>
                  <TokenLogo address={token0?.id} size={'18px'} />
                  <TYPE.main fontSize={'12px'} lineHeight={1} fontWeight={500} ml={'4px'} color="#0B1359">
                    {token0 && token1
                      ? `1 ${formattedSymbol0} = ${token0Rate} ${formattedSymbol1} ${
                          parseFloat(token0?.derivedETH) ? '(' + token0USD + ')' : ''
                        }`
                      : '-'}
                  </TYPE.main>
                </RowFixed>
              </FixedPanel>
              <FixedPanel onClick={() => history.push(`/token/${token1?.id}`)} style={{marginLeft: '8px'}}>
                <RowFixed>
                  <TokenLogo address={token1?.id} size={'18px'} />
                  <TYPE.main fontSize={'12px'} lineHeight={1} fontWeight={500} ml={'4px'} color="#0B1359">
                    {token0 && token1
                      ? `1 ${formattedSymbol1} = ${token1Rate} ${formattedSymbol0}  ${
                          parseFloat(token1?.derivedETH) ? '(' + token1USD + ')' : ''
                        }`
                      : '-'}
                  </TYPE.main>
                </RowFixed>
              </FixedPanel>
            </AutoRow>
            <>
              <PanelWrapper style={{ marginTop: '5px' }}>
                <StyledCard>
                  <RowBetween>
                    <TYPE.defHeader>Total Liquidity {!usingTracked ? '(Untracked)' : ''}</TYPE.defHeader>
                    <div />
                  </RowBetween>
                  <RowBetween align="flex-end">
                    <TYPE.def fontSize={24}>
                      {liquidity}
                    </TYPE.def>
                    <TYPE.def fontSize={16}>{liquidityChange}</TYPE.def>
                  </RowBetween>
                </StyledCard>
                <StyledCard>
                  <RowBetween>
                    <TYPE.defHeader>Volume (24 hrs) {usingUtVolume && '(Untracked)'}</TYPE.defHeader>
                    <div />
                  </RowBetween>
                  <RowBetween align="flex-end">
                    <TYPE.def fontSize={24}>
                      {volume}
                    </TYPE.def>
                    <TYPE.def fontSize={16}>{volumeChange}</TYPE.def>
                  </RowBetween>
                </StyledCard>
                <StyledCard>
                  <RowBetween>
                    <TYPE.defHeader>Fees (24 hrs)</TYPE.defHeader>
                    <div />
                  </RowBetween>
                  <RowBetween align="flex-end">
                    <TYPE.def fontSize={24}>
                      {fees}
                    </TYPE.def>
                    <TYPE.def fontSize={16}>{volumeChange}</TYPE.def>
                  </RowBetween>
                </StyledCard>

                <StyledCard style={{height: '152px'}}>
                  <RowBetween>
                    <TYPE.defHeader>Pooled Tokens</TYPE.defHeader>
                    <div />
                  </RowBetween>
                  <div>
                    <Hover onClick={() => history.push(`/token/${token0?.id}`)} fade={true} style={{paddingBottom: '12px'}}>
                      <AutoRow gap="4px">
                        <TokenLogo address={token0?.id} />
                        <TYPE.def fontSize={16} style={{marginLeft: '8px'}} >
                          <RowFixed>
                            {reserve0 ? formattedNum(reserve0) : ''}{' '}
                            <FormattedName text={token0?.symbol ?? ''} maxCharacters={8} margin={true} />
                          </RowFixed>
                        </TYPE.def>
                      </AutoRow>
                    </Hover>
                    <Hover onClick={() => history.push(`/token/${token1?.id}`)} fade={true}>
                      <AutoRow gap="4px">
                        <TokenLogo address={token1?.id} />
                        <TYPE.def fontSize={16} style={{marginLeft: '8px'}} >
                          <RowFixed>
                            {reserve1 ? formattedNum(reserve1) : ''}{' '}
                            <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} margin={true} />
                          </RowFixed>
                        </TYPE.def>
                      </AutoRow>
                    </Hover>
                  </div>
                </StyledCard>
                <Panel
                  style={{
                    gridColumn: below1080 ? '1' : '2/4',
                    gridRow: below1080 ? '' : '1/5',
                  }}
                >
                  <PairChart
                    address={pairAddress}
                    color={backgroundColor}
                    base0={reserve1 / reserve0}
                    base1={reserve0 / reserve1}
                  />
                </Panel>
              </PanelWrapper>
              <TYPE.main fontSize={24} color={'#0B1359'} style={{ marginTop: '3rem' }}>
                Transactions
              </TYPE.main>{' '}
              <Panel
                style={{
                  marginTop: '1.5rem',
                  padding: '0',
                }}
              >
                {transactions ? <TxnList transactions={transactions} /> : <Loader />}
              </Panel>
              <RowBetween style={{ marginTop: '40px' }}>
                <TYPE.main fontSize={24} color={'#0B1359'}>Pair Information</TYPE.main>{' '}
              </RowBetween>
              <Panel
                rounded
                style={{
                  marginTop: '23px',
                  padding: '8px'
                }}
                p={20}
              >
                <TokenDetailsLayout>
                  <StyledPairInformationBlock isHeader>
                    <TYPE.def
                      fontSize={12}
                      style={{textTransform: 'uppercase'}}
                      fontWeight={700}>
                        Pair Name
                    </TYPE.def>
                    <TYPE.def
                      fontSize={12}
                      style={{textTransform: 'uppercase'}}
                      fontWeight={700}>
                        Pair Address
                    </TYPE.def>
                    <RowFixed>
                      <FormattedName
                        text={token0?.symbol ?? ''}
                        maxCharacters={8}
                        fontSize='12px'
                        style={{textTransform: 'uppercase', fontWeight: '700'}}/>{' '}
                      <TYPE.def
                        fontSize={12}
                        style={{textTransform: 'uppercase', marginLeft: '4px'}}
                        fontWeight={700}>
                          Address
                      </TYPE.def>
                    </RowFixed>
                    <RowFixed>
                      <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} fontSize='12px' style={{textTransform: 'uppercase', fontWeight: '700'}}/>{' '}
                      <TYPE.def fontSize={12} style={{textTransform: 'uppercase', marginLeft: '4px'}} fontWeight={700}>Address</TYPE.def>
                    </RowFixed>
                    <RowFixed style={{opacity: 0}}>
                      <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} />{' '}
                      <span style={{ marginLeft: '4px' }}>Address</span>
                    </RowFixed>
                  </StyledPairInformationBlock>
                  <StyledPairInformationBlock style={{paddingLeft: '16px', marginTop: '16px', alignItems: 'center'}}>
                    <Column>
                      <TYPE.main>
                        <RowFixed style={{color: '#6C5DD3', fontSize: '14px'}}>
                          <FormattedName text={token0?.symbol ?? ''} maxCharacters={8} style={{color: '#6C5DD3', fontSize: '14px'}}/>
                          -
                          <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} style={{color: '#6C5DD3', fontSize: '14px'}}/>
                        </RowFixed>
                      </TYPE.main>
                    </Column>
                    <Column>
                      <AutoRow style={{alignItems: 'center'}}>
                        <TYPE.main fontSize={14} color={'#0B1359'}>
                          {pairAddress.slice(0, 6) + '...' + pairAddress.slice(38, 42)}
                        </TYPE.main>
                        <CopyHelper toCopy={pairAddress} />
                      </AutoRow>
                    </Column>
                    <Column>
                      <AutoRow style={{alignItems: 'center'}}>
                        <TYPE.main fontSize={14} color={'#0B1359'}>
                          {token0 && token0.id.slice(0, 6) + '...' + token0.id.slice(38, 42)}
                        </TYPE.main>
                        <CopyHelper toCopy={token0?.id} />
                      </AutoRow>
                    </Column>
                    <Column>
                      <AutoRow style={{alignItems: 'center'}}>
                        <TYPE.main fontSize={14} color={'#0B1359'}>
                          {token1 && token1.id.slice(0, 6) + '...' + token1.id.slice(38, 42)}
                        </TYPE.main>
                        <CopyHelper toCopy={token1?.id} />
                      </AutoRow>
                    </Column>
                    <ButtonLight color={'#6C5DD3'}>
                      <Link external href={'https://bscscan.com/address/' + pairAddress}>
                        View on BscScan
                      </Link>
                    </ButtonLight>
                  </StyledPairInformationBlock>
                </TokenDetailsLayout>
              </Panel>
            </>
          </DashboardWrapper>
        </WarningGrouping>
      </ContentWrapperLarge>
    </StyledPageWrapper>
  )
}

export default withRouter(PairPage)
