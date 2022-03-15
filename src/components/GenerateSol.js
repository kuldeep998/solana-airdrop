import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import * as XLSX from 'xlsx';
import $ from 'jquery';
import { Box, Button, TextField, Typography } from '@mui/material';

const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  Account,
} = require("@solana/web3.js");




const GenerateSol = () => {


  let [prevWallet, setPrevWallet] = useState();
  let [prevBalance, setPrevBalance] = useState();
  let [afterWallet, setAfterWallet] = useState();
  let [afterBalance, setAfterBalance] = useState();

  useEffect(() => {
    // console.log("constructor working");
  }, []);

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  console.log(connection);
  console.log(connection.getAccountInfo.PublicKey);


  const getWalletBalance = async (walletAddress) => {
    try {
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      console.log("fetch public key " + walletAddress);
      const walletBalance = await connection.getBalance(
        new PublicKey(walletAddress)
      );
      console.log(`   Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL}SOL`);
    } catch (err) {
      console.log(err);
    }
  };

  const airDropSol = async (walletAddress, userLamport) => {
    try {
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      console.log(connection.getAccountInfo.PublicKey);
      console.log(connection.wallet.PublicKey);
      console.log(`-- Airdropping ` + userLamport + " to " + walletAddress + " wallet address");
      const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(walletAddress),
        userLamport * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(fromAirDropSignature);
      console.log("transaction completed");
    } catch (err) {
      console.log(err);
    }
  };

  const driverFunction = async () => {

    var listLength = parseInt(data.length);
    if (listLength === 0 || listLength === null) {
      alert("Please enter csv file");
      return null;
    }


    var userLamport = $("#lamportvalue").val();
    console.log(userLamport);
    if (userLamport === '0' || userLamport === null) {
      alert("Please enter lamports");
      return null;
    }


    for (var i = 0; i < data.length; i++) {
      console.log(data[i]);

      if (data[i].wallet !== null) {
        //  await getWalletBalance(data[i].wallet);
        await airDropSol(data[i].wallet, userLamport);
        // await getWalletBalance(data[i].wallet);
      }
    }
  }


  //  csv upload 
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);


  // process CSV data
  const processData = dataString => {
    const dataStringLines = dataString.split(/\r\n|\n/);
    const headers = dataStringLines[0].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);

    const list = [];
    for (let i = 1; i < dataStringLines.length; i++) {
      const row = dataStringLines[i].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
      if (headers && row.length == headers.length) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          let d = row[j];
          if (d.length > 0) {
            if (d[0] == '"')
              d = d.substring(1, d.length - 1);
            if (d[d.length - 1] == '"')
              d = d.substring(d.length - 2, 1);
          }
          if (headers[j]) {
            obj[headers[j]] = d;
          }
        }

        // remove the blank rows
        if (Object.values(obj).filter(x => x).length > 0) {

          list.push(obj);
        }
      }
    }


    // prepare columns list from headers
    const columns = headers.map(c => ({
      name: c,
      selector: c,
    }));

    setData(list);
    setColumns(columns);
  }


  // handle file upload
  const handleFileUpload = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      /* Parse data */
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
      processData(data);
    };
    reader.readAsBinaryString(file);
  }

  return (
    <>

      <Box sx={{ marginTop: "60px" }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography color="primary">Import Users</Typography>
        </Box>
        <Box sx={{ marginTop: "30px" }}>
          <Typography sx={{ fontSize: "14px", color: "gray" }}>If you have a large number of users, you can upload them using a CSV file.</Typography>
        </Box>
        <Box>
          <Box sx={{ margin: "30px auto" }}>
            <Typography>Step 1 - Download a CSV template</Typography>
            <Box sx={{ marginTop: "20px", cursor: 'pointer' }}>
              <label for="download-btn" style={{ border: "1px solid gray", padding: "10px 40px", borderRadius: "2px" }}>Download CSV Template</label>
              <input type="file" id="download-btn" hidden />
            </Box>
          </Box>
          <Box sx={{ margin: "30px auto" }}>
            <Typography>Step 2 - Upload the CSV template</Typography>
            <Box sx={{ marginTop: "20px", cursor: 'pointer' }}>
              <label for="upload-btn" style={{ border: "1px solid gray", padding: "10px 40px", borderRadius: "2px" }}>Upload File</label>
              <input type="file" id="upload-btn" accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload} hidden />
            </Box>
          </Box>
          <Box>
            <DataTable
              pagination
              highlightOnHover
              columns={columns}
              data={data}
            />
          </Box>
          <Box sx={{ margin: "30px auto" }}>
            <Typography>Step 3 - Solana Air Drop Block</Typography>
            <Box sx={{ marginTop: "8px" }}>
              <TextField variant='outlined' placeholder="Enter Lamport" defaultValue="0" id="lamportvalue" type="number" />
            </Box>
          </Box>
          <Box sx={{ textAlign: 'center', marginTop: "40px" }}>
            <Button color="secondary" onClick={(e) => { driverFunction() }}>Start Air Drop Process</Button>
          </Box>
        </Box>
      </Box>













      {/* <h3>Read CSV file in React</h3>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileUpload}
      />
      <DataTable
        pagination
        highlightOnHover
        columns={columns}
        data={data}
      />
      <hr />
      <h3>Solana Air Drop Block</h3>
      <input type="number" placeholder="Enter Lamport" defaultValue="0" id="lamportvalue" /><br /><br /><br />

      <button onClick={(e) => { driverFunction() }}>Start Air Drop Process</button>

      <hr /> */}


    </>);
}

export default GenerateSol;
