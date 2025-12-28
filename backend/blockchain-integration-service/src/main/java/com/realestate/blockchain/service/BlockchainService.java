package com.realestate.blockchain.service;

import org.springframework.stereotype.Service;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.response.EthBlockNumber;
import org.web3j.protocol.core.methods.response.EthGetBalance;
import org.web3j.utils.Convert;

import java.math.BigDecimal;
import java.util.concurrent.ExecutionException;

@Service
public class BlockchainService {

    private final Web3j web3j;

    public BlockchainService(Web3j web3j) {
        this.web3j = web3j;
    }

    public Long getBlockNumber() throws ExecutionException, InterruptedException {
        EthBlockNumber blockNumber = web3j.ethBlockNumber().sendAsync().get();
        return blockNumber.getBlockNumber().longValue();
    }

    public BigDecimal getAddressBalance(String address) throws ExecutionException, InterruptedException {
        EthGetBalance balance = web3j.ethGetBalance(address, DefaultBlockParameterName.LATEST).sendAsync().get();
        return Convert.fromWei(balance.getBalance().toString(), Convert.Unit.ETHER);
    }
}
