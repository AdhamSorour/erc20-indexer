import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { ethers } from 'ethers';
import { useState } from 'react';

function App() {
  const [userAddress, setUserAddress] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokens, setTokens] = useState([]);

	const handleInputChange = (e) => {
		setUserAddress(e.target.value);
		setInvalid(false);
	}

  async function getTokenBalance() {
    if (!ethers.utils.isAddress(userAddress)) {
			setInvalid(true);
      return;
		}

    setLoading(true);

    const alchemy = new Alchemy({
      apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
      network: Network.ETH_MAINNET,
    });

    const tokenData = await alchemy.core.getTokenBalances(userAddress);

    const tokenMetadata = await Promise.allSettled(
      tokenData.tokenBalances.map(
        token => alchemy.core.getTokenMetadata(token.contractAddress)
      )
    );

    const tokenInfo = [];
    for (let i = 0; i < tokenMetadata.length; i++) {
      if (tokenMetadata[i].status === "fulfilled") {
        tokenInfo.push({
          ...tokenData.tokenBalances[i],
          ...tokenMetadata[i].value
        })
      }
    }
    console.log(tokenInfo);
    setTokens(tokenInfo);
    setHasQueried(true);
    setLoading(false);
  }
  return (
    <Box w="98vw">
      <Center>
        <Flex
          alignItems={'center'}
          justifyContent="center"
          flexDirection={'column'}
        >
          <Heading mb={0} fontSize={36}>
            ERC-20 Token Indexer
          </Heading>
          <Text>
            Plug in an address and this website will return all of its ERC-20
            token balances!
          </Text>
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={'center'}
      >
        <Heading mt={42}>
          Get all the ERC-20 token balances of this address:
        </Heading>
        <Input
          isInvalid={invalid}
          errorBorderColor='crimson'
          onChange={handleInputChange}
          color="black"
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
        />
        {invalid? <Text color="red">Invalid Address</Text> : ""}
        <Button 
          isLoading={loading}
          loadingText='Fetching Tokens'      
          fontSize={20} 
          onClick={getTokenBalance} 
          mt={36} 
          bgColor="blue"
        >
          Check ERC-20 Token Balances
        </Button>

        {hasQueried ? (
          <>
          <Heading my={36}>ERC-20 token balances:</Heading>
          <SimpleGrid w={'90vw'} columns={8} spacing={50} >
            {tokens.map((token, i) => {
              return (
                <Flex
                  flexDir='column'
                  color="white"
                  bg="blue"
                  w='8vw'
                  key={i}
                >
                  <Box>
                    <b>Symbol:</b> ${token.symbol}
                  </Box>
                  <Box>
                    <b>Balance:</b> {Utils.formatUnits(token.tokenBalance, token.decimals)}
                  </Box>
                  <Image src={token.logo} />
                </Flex>
              );
            })}
          </SimpleGrid>
          </>
        ) : ""}
      </Flex>
    </Box>
  );
}

export default App;
