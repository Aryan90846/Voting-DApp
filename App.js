import React, { useEffect, useState } from "react";
import Web3 from "web3";
import VotingABI from "./VotingABI.json";
import { Container, Row, Col, Button, Card, Alert, Spinner } from "react-bootstrap";

// ✅ Replace with your deployed contract address
const contractAddress = "0xYourContractAddressHere";

function App() {
  const [account, setAccount] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [votingEnded, setVotingEnded] = useState(false);
  const [winner, setWinner] = useState("");
  const [loading, setLoading] = useState(false);

  const [contract, setContract] = useState(null);
  const [web3, setWeb3] = useState(null);

  // 🚀 Connect to MetaMask
  const loadWeb3 = async () => {
    if (window.ethereum) {
      const w3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await w3.eth.getAccounts();
      setAccount(accounts[0]);
      setWeb3(w3);

      const voting = new w3.eth.Contract(VotingABI, contractAddress);
      setContract(voting);

      const admin = await voting.methods.admin().call();
      setIsAdmin(accounts[0].toLowerCase() === admin.toLowerCase());

      const ended = await voting.methods.votingEnded().call();
      setVotingEnded(ended);

      try {
        const hasVotedFlag = await voting.methods.hasVoted(accounts[0]).call();
        setHasVoted(hasVotedFlag);
      } catch (err) {
        console.log("Error checking vote status");
      }

      const data = await voting.methods.getCandidates().call();
      setCandidates(data);

      if (ended) {
        const win = await voting.methods.getWinner().call();
        setWinner(win);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  useEffect(() => {
    loadWeb3();
  }, []);

  // 🗳️ Vote Function
  const vote = async (index) => {
    try {
      setLoading(true);
      await contract.methods.vote(index).send({ from: account });
      alert("Vote cast successfully!");
      setHasVoted(true);
      const updated = await contract.methods.getCandidates().call();
      setCandidates(updated);
    } catch (err) {
      alert("Error voting: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🛑 Admin ends voting
  const endVoting = async () => {
    try {
      setLoading(true);
      await contract.methods.endVoting().send({ from: account });
      setVotingEnded(true);
      const win = await contract.methods.getWinner().call();
      setWinner(win);
      alert("Voting ended. Winner: " + win);
    } catch (err) {
      alert("Error ending voting: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">🗳️ Voting DApp by Aryan Choudhary</h2>

      <Alert variant="info">
        Connected Wallet: <strong>{account}</strong>
      </Alert>

      {loading && (
        <div className="text-center mb-3">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {votingEnded && (
        <Alert variant="success">
          ✅ Voting has ended. Winner: <strong>{winner}</strong>
        </Alert>
      )}

      {!votingEnded && hasVoted && (
        <Alert variant="secondary">You have already voted.</Alert>
      )}

      <Row>
        {candidates.map((cand, index) => (
          <Col md={3} sm={6} xs={12} key={index} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title>{cand.name}</Card.Title>
                <Card.Text>Votes: {cand.voteCount}</Card.Text>
                {!hasVoted && !votingEnded && (
                  <Button
                    variant="primary"
                    onClick={() => vote(index)}
                    disabled={loading}
                  >
                    Vote
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {isAdmin && !votingEnded && (
        <div className="text-center mt-4">
          <Button variant="danger" onClick={endVoting} disabled={loading}>
            End Voting (Admin)
          </Button>
        </div>
      )}
    </Container>
  );
}

export default App;
