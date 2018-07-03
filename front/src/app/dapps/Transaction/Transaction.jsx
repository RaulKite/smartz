import React, { Component } from 'react';

import Loader from '../../common/loader/Loader';
import {
  processResult,
  makeEtherscanLink,
  decodeEventOfDapp,
  makeTxEtherscanLink
} from '../../../helpers/eth';

class Transaction extends Component {
  render() {
    const { time, func, formData, txHash, result, timeMined } = this.props.transaction;
    const { netId, contractDapp } = this.props;

    return (
      <div>
        <ul>
          <li className="func-name">
            {func.title} ({func.name})
          </li>

          <li>
            Executed at {time.format('HH:mm:ss')} on {time.format('ll')}
            {txHash && result && `, mined at ${timeMined.format('HH:mm:ss')}`}
          </li>

          {txHash && <li className="tx-link">{makeTxEtherscanLink(txHash, netId)}</li>}

          {formData.length > 0 && (
            <li className="tx-params">
              Parameters:{' '}
              {formData.map((field, i) => (
                <span key={i}>
                  <br />
                  {func.inputs.items[i].title} = {makeEtherscanLink(field, netId)}
                </span>
              ))}
            </li>
          )}

          {result && (
            <li className="tx-result">
              Result:{' '}
              {txHash && (result.status === '0x1' ? 'done' : 'error') // write function
              }
              {!txHash && // ask functions
                processResult(result, func.outputs ? func.outputs.items : undefined)
                  .split('\n')
                  .map((item, key) => {
                    return (
                      <span key={key}>
                        {item}
                        <br />
                      </span>
                    );
                  })}
            </li>
          )}

          {result &&
            txHash &&
            result.logs &&
            result.logs.length > 0 && (
              <li>
                <strong>Events:</strong>
                {result.logs.map((log, i) => {
                  let event = decodeEventOfDapp(contractDapp, log);

                  if (!event) {
                    return '';
                  }

                  return (
                    <div key={i}>
                      {event.name} ({Object.keys(event.params)
                        .map((key) => `${key}=${event.params[key]}`)
                        .join(', ')})
                    </div>
                  );
                })}
              </li>
            )}

          {txHash &&
            !result && (
              <li>
                <Loader text="Waiting for miners..." width={'30px'} />
              </li>
            )}
        </ul>
      </div>
    );
  }
}

export default Transaction;