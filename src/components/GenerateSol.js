import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import * as XLSX from 'xlsx';
import $ from 'jquery';
import { Box, Button, TextField, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, Provider } from '@project-serum/anchor';
toast.configure()
const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  Account,
  SystemProgram
} = require("@solana/web3.js");

const GenerateSol = () => {


  let [prevWallet, setPrevWallet] = useState();
  let [prevBalance, setPrevBalance] = useState();
  let [afterWallet, setAfterWallet] = useState();
  let [afterBalance, setAfterBalance] = useState();



  let requestArray = new Array();

  const wallet = useWallet();
  const { publicKey } = useWallet();
  useEffect(() => {
    console.log(wallet);
    if (wallet?.publicKey) {
      let user = {
        walletAddress: wallet.publicKey.toString()
      }
      var x = document.getElementById("maincode");
      if (x.style.display === "none") {
        x.style.display = "block";
      }

    }
    else {

      var x = document.getElementById("maincode");
      if (x.style.display === "block") {
        x.style.display = "none";
      }

    }
  }, [wallet.publicKey])


  const notify = () => {
    toast('successfully airdroped')
  }
  const web3 = require("@solana/web3.js");
  const connection = new web3.Connection(
    web3.clusterApiUrl('devnet'),
    'confirmed',
  );


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


  const driverFunction = async () => {

    var spinner = $('#loader');
		spinner.show();

    var listLength = parseInt(data.length);
    if (listLength === 0 || listLength === null) {
      
      spinner.hide();
      toast('Please upload csv file');
      return null;
    }


    var userLamport = $("#lamportvalue").val();
    console.log(userLamport);
    if (userLamport === '0' || userLamport === null) {
      spinner.hide();
      toast('Please enter lamports');
      return null;
    }


    for (var i = 0; i < data.length; i++) {
      console.log(data[i]);
      if (data[i].wallet !== null) {
        await transfer(data[i].wallet, userLamport);
      }
    }


    if (requestArray.length === 0) {
      spinner.hide();
      toast('Transactions not exists')
      
      return null;
    }
    else {
      try {
        let opts = {
          preflightCommitment: "recent",
          commitment: "recent",
        };
        const connection = new Connection("https://api.devnet.solana.com", "confirmed");
        let provider = new Provider(connection, wallet, opts);
        const signature = await provider.sendAll(requestArray, {
          commitment: "recent",
          preflightCommitment: "recent",
          skipPreflight: true,
        });
        spinner.hide();
        console.log("signatiure ", signature);
        toast('Transaction successfully');
      } catch (error) {
        spinner.hide();
        console.log("Transaction failed, please check your inputs and try again");
        console.log(error);
      }
    }


  }


  /* ashish code */
  const transfer = async (userWalletAddress, userlamports) => {
    var spinner = $('#loader');
		
    if (!wallet) return;

    try {
      let opts = {
        preflightCommitment: "recent",
        commitment: "recent",
      };
      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      let provider = new Provider(connection, wallet, opts);
      const Ix = web3.SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey(userWalletAddress),
        lamports: userlamports * LAMPORTS_PER_SOL,
      });
      const transaction = new Transaction().add(Ix);
      const req = { tx: transaction, signers: [] };
      requestArray.push(req);
    } catch (error) {
      spinner.hide();
      console.log("Transaction failed, please check your inputs and try again");
      console.log(error);
    }
  };


  return (
    <>
      <div id="loader"></div>
      <div id="maincode" style={{ display: "none" }}>
        <Box sx={{ marginTop: "60px" }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography color="primary">Import Users</Typography>
          </Box>
          <Box sx={{ marginTop: "30px" }}>
            <Typography sx={{ fontSize: "14px", color: "gray" }}>If you have a large number of users, you can upload them using a CSV file.</Typography>
          </Box>
          <Box>
            <Box sx={{ margin: "30px auto" }}>
              <Typography>Step 1 - Upload the CSV template</Typography>
              <Box sx={{ marginTop: "20px", cursor: 'pointer' }}>
                <label htmlFor="upload-btn" style={{ border: "1px solid gray", padding: "10px 40px", borderRadius: "2px" }}>Upload File</label>
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
              <Typography>Step 2 - Enter Lamport Value</Typography>
              <Box sx={{ marginTop: "8px" }}>
                <TextField variant='outlined' placeholder="Enter Lamport" defaultValue="0" id="lamportvalue" type="number" />
              </Box>
            </Box>
            <Box sx={{ textAlign: 'center', marginTop: "40px" }}>
              <Button color="secondary" onClick={(e) => { driverFunction() }}>Start Air Drop Process</Button>

              {/*   <Button color="secondary" onClick={(e) => { transfer() }}>Ashish Air Drop Process</Button> */}
            </Box>
          </Box>
        </Box>
      </div>
    </>);
}

export default GenerateSol;
