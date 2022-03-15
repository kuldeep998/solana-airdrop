import { Box, Button, Paper } from '@mui/material'
import React, { useEffect } from 'react'
import GenerateSol from './GenerateSol'
import {
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

function Home() {
    const wallet = useWallet();
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    useEffect(() => {
        if (wallet?.publicKey) {
            let user = {
                walletAddress: wallet.publicKey.toString()
            }
            console.log(user)
        }
    }, [wallet.publicKey])
    return (
        <Box display="flex" justifyContent="center">
            <Paper sx={{ width: "40%", padding: "30px", marginTop: "30px" }}>
                <Box display="flex" justifyContent="center">
                    {/* <Button color="primary" variant='outlined'>Connect Wallet</Button> */}
                    <WalletMultiButton style={{ border: "1px solid rgba(0,0,0,0.9)", background: 'transparent', color: "rgba(0,0,0,0.9)", fontWeight: 'lighter' }}>Connect Wallet</WalletMultiButton>
                </Box>
                <Box>
                    <GenerateSol />
                </Box>
            </Paper>
        </Box>
    )
}

export default Home