import { Tabs, Tab } from 'react-bootstrap'
import dBank from '../abis/dBank.json'
import React, { Component } from 'react';
import Token from '../abis/Token.json'
import dbank from '../dbank.png';
import Web3 from 'web3';
import './App.css';

//h0m3w0rk - add new tab to check accrued interest

class App extends Component {

  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {

    //check if MetaMask exists
      if (typeof window.ethereum !== 'undefined') {
        // connetto a metamask
        await window.ethereum.enable();
        
        //assign to values to variables: web3, netId, accounts
        const web3 = new Web3(window.ethereum);
        const netId = await web3.eth.net.getId();
        const accounts = await web3.eth.getAccounts();

        //check if account is detected, then load balance&setStates, elsepush alert
        if (typeof accounts[0] !== 'undefined') {
            const balance = await web3.eth.getBalance(accounts[0]);
            this.setState({account: accounts[0], balance: balance, web3: web3})
        } else {
          window.alert('Please login with Metamask');
        }

        try {
            const token = new web3.eth.Contract(Token.abi, Token.networks[netId].address);
            const dbank = new web3.eth.Contract(dBank.abi, dBank.networks[netId].address);
            const dBankAddress = dBank.networks[netId].address;
            const tokenBalance = await token.methods.balanceOf(this.state.account).call();
            console.log(web3.utils.fromWei(tokenBalance));
            // const defiToken = web3.utils.fromWei(tokenBalance);
            this.setState({token: token, dbank: dbank, dBankAddress: dBankAddress})
            console.log(dBankAddress);
        } catch(e) {
            console.log('Error', e)
            window.alert('Contracts not deployed to the current network');
        }
      } else {
        //if MetaMask not exists push alert
          window.alert('Please install Metamask');
      }




  }

  async deposit(amount) {
    //check if this.state.dbank is ok
    if(this.state.dbank!=='undefined'){
      try{
      //in try block call dBank deposit();
        await this.state.dbank.methods.deposit().send({value: amount.toString(), from: this.state.account})
      } catch (e) {
        console.log('Error, deposit: ', e)
      }
    }
  }

  async withdraw(e) {
    //prevent button from default click
    e.preventDefault()
    //check if this.state.dbank is ok
    if(this.state.dbank!=='undefined'){
      try{
    //in try block call dBank withdraw();
        await this.state.dbank.methods.withdraw().send({from: this.state.account})
      } catch(e) {
        console.log('Error, withdraw: ', e)
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      dbank: null,
      balance: 0,
      dBankAddress: null
    }
  }

  render() {
    return (
      <div className='text-monospace'>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
        <img src={dbank} className="App-logo" alt="logo" height="32"/>
          <b>dBank</b>
        </a>
        </nav>
        <div className="container-fluid mt-5 text-center">
        <br></br>
          <h1>Benvenuto nella Banca Defi</h1>
          <h2>Il tuo indirizzo è: {this.state.account}</h2>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
              <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                <Tab eventKey="deposit" title="Deposita">
                    <div>
                        <br></br>
                        Quanto vuoi depositare?
                        <br></br>
                        (Deposito minimo: 0.01 ETH)
                        <br></br>
                        (Un deposito alla volta)
                        <br></br>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            let amount = this.depositAmount.value;
                            amount = amount * 10**18; //convert to wei
                            this.deposit(amount);
                             
                        }}>
                            <div className="form-group mr-sm-2">
                            <br></br>
                            <input id="depositAmount" step="0.01" type="number" className="form-control form-control-md" placeholder="Inserisci valore..."
                            required
                            ref={(input) => {this.depositAmount = input}}
                            />
                            </div>
                            <button type="submit" className="btn btn-primary">Deposita</button>
                        </form>
                    </div>
                </Tab>
                <Tab eventKey="withdraw" title="Preleva">
                    <br></br>
                    Vuoi prelevare e avere gli interessi?
                    <br></br>
                    <br></br>
                    <div>
                        <button type='submit' className='btn btn-primary' onClick={(e) => this.withdraw(e)}>Preleva</button>
                    </div>
                </Tab>
              </Tabs>
              <div className="container-fluid mt-5 text-center">
                  I tuoi interessi in DeFi Bank Token accumulati sono:
                  {this.state.tokenBalance}
              </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;