import React, { PureComponent } from 'react';

import { web3 as w3, getNetworkId, getTxReceipt, getAccountAddress } from '../../../helpers/eth';
import Eos from '../../../helpers/eos';
import Spinner from '../../common/Spinner';
import UnlockMetamaskPopover from '../../common/unlock-metamask-popover/UnlockMetamaskPopover';
import { ethConstants } from '../../../constants/constants';
import { blockchains } from './../../../constants/constants';
import { sendStatusContractEvent } from '../../../helpers/data-layer';
import { contractProcessStatus } from '../../../constants/constants';

class DeployStep2 extends PureComponent {
  constructor(props) {
    super(props);

    this.deploy = this.deploy.bind(this);
  }

  componentWillMount() {
    window.scrollTo(0, 0);
  }

  deploy(e) {
    e.preventDefault();

    const {
      deployId,
      deployTxSent,
      deployTxError,
      deployTxMined,
      metamaskStatus,
      dapp,
      ctor,
      publicAccess
    } = this.props;
    const { bin, blockchain, abi, instance_id } = dapp;
    const { price_eth, ctor_id } = ctor;

    if (blockchain === blockchains.ethereum && metamaskStatus != 'okMetamask') {
      return alert('Unlock metamask!');
    }

    switch (blockchain) {
      case blockchains.ethereum:
        w3.eth.sendTransaction(
          {
            data: `0x${bin}`,
            value: w3.toWei(price_eth, 'ether'),
            gas: ethConstants.gas,
            gasPrice: ethConstants.gasPrice
          },
          (err, txHash) => {
            if (err) {
              let errMsg = '';
              try {
                errMsg = err.message.split('\n')[0];
              } catch (error) {
                errMsg = 'Unknown error';
              }
              deployTxError(deployId, errMsg);
            } else {
              const dataEvent = {
                dimension2: `${window.location.origin}/deploy/${ctor_id}`,
                dimension3: `${window.location.origin}/dapp/${instance_id}`,
                dimension4: blockchain,
                metric1: price_eth,
                metric2: ethConstants.gas,
                metric3: ethConstants.gasPrice
              };

              getNetworkId((netId) => {
                deployTxSent(deployId, netId, txHash, blockchain);

                dataEvent.dimension5 = netId;

                sendStatusContractEvent({
                  status: contractProcessStatus.DEPLOY,
                  ...dataEvent
                });
              });

              getTxReceipt(txHash, (receipt) => {
                if (!receipt.status || receipt.status === '0x0' || receipt.status === '0') {
                  deployTxError(deployId, 'Something went wrong!');
                } else {
                  deployTxMined(deployId, receipt.contractAddress);

                  sendStatusContractEvent({
                    status: contractProcessStatus.MINED,
                    ...dataEvent
                  });
                }
              });
            }
          }
        );
        break;

      case blockchains.eos:
        const dataEvent = {
          dimension2: `${window.location.origin}/deploy/${ctor_id}`,
          dimension3: `${window.location.origin}/dapp/${instance_id}`,
          dimension4: blockchain
        };

        // get chainId to set 'networkId'
        Eos.setChainId()
          .then(() => {
            dataEvent.dimension5 = Eos.configEosDapp.chainId;

            // get identity to set addressSender
            return Eos.getIdentity();
          })
          .then((identity) => {
            Eos.deployContract(bin, abi)
              .then((result) => {
                deployTxMined(deployId, result.transaction_id);

                // send event to gtm
                sendStatusContractEvent({
                  status: contractProcessStatus.MINED,
                  ...dataEvent
                });
              })
              .catch((error) => {
                console.error(error);
                const msgError = error.message ? error.message : error;

                deployTxError(deployId, msgError);
              });

            deployTxSent(deployId, Eos.configEosDapp.chainId, null, blockchain);

            // send event to gtm
            sendStatusContractEvent({
              status: contractProcessStatus.DEPLOY,
              ...dataEvent
            });
          })
          .catch((error) => console.error(error));
        break;

      default:
        break;
    }
  }

  render() {
    const { deployId, ctor, dapp, status, setPublicAccess, blockchain } = this.props;

    return (
      <div>
        {/* popover 'Unlock metamask' */}
        {blockchain === blockchains.ethereum &&
          metamaskStatus === 'unlockMetamask' && <UnlockMetamaskPopover />}

        {status === 'construct_request' && (
          <div className="block__wrapper  block__wrapper--top">
            <Spinner text="Preparing code, this can take some seconds..." />
          </div>
        )}

        {status === 'construct_success' && (
          <form>
            <div className="block__wrapper  block__wrapper--top">
              <fieldset className="form-block">
                <div className="form-field">
                  <label className="form-field__label">Your smart contract source code</label>
                  <span className="form-block__description">
                    Carefully prepared for you using only the finest ingredients
                  </span>
                  <div className="form-field__input-wrapper">
                    <div
                      id="textarea"
                      className="form-field__input  form-field__input--textarea"
                      style={{
                        height: '500px',
                        overflowY: 'auto',
                        fontSize: '12px',
                        whiteSpace: 'pre',
                        fontFamily: 'monospace'
                      }}>
                      {dapp.source ||
                        "If you don't see source code here, perhaps something gone wrong"}
                    </div>
                  </div>
                </div>
              </fieldset>
              <fieldset className="block__wrapper  block__wrapper--terms">
                <fieldset className="form-block  form-block--terms">
                  <div className="form-field  form-field--terms">
                    <input
                      type="checkbox"
                      className="form-field__input  form-field__input--checkbox form-field__input--terms  visually-hidden"
                      id="restrict-public-access"
                      onChange={(e) => {
                        setPublicAccess(deployId, !e.target.checked);
                      }}
                    />
                    <label
                      className="form-field__label  form-field__label--checkbox  form-field__label--terms"
                      htmlFor="restrict-public-access">
                      <svg
                        className="form-field__icon  form-field__icon-checkbox"
                        width="23"
                        height="23">
                        <use className="form-field__icon-off" href="#checkbox" />
                        <use className="form-field__icon-on" href="#checkbox-on" />
                      </svg>
                      <span className="form-field__wrapper">
                        <b className="form-field__description  form-field__description--terms">
                          Restrict public access to the contract UI.
                        </b>
                      </span>
                    </label>
                  </div>
                </fieldset>
              </fieldset>
              <button className="button block__button" onClick={this.deploy}>
                {ctor.price_eth ? (
                  <span>Deploy now for {ctor.price_eth} ETH</span>
                ) : (
                  <span>Deploy now for free</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }
}

export default DeployStep2;
