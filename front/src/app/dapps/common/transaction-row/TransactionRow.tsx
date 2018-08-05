import * as classNames from 'classnames';
import * as React from 'react';
import InlineSVG from 'svg-inline-react';

import { formatTime } from '../../../../helpers/normalize';
import { copyTextToClipboard } from '../../../../helpers/utils';
import AddressString from '../../../common/address-string/AddressString';
import Loader from '../../../common/loader/Loader';

import './TransactionRow.less';


interface ITransactionRowProps {
  transaction: any;
  onClick: (request: any) => any;
}

export default class TransactionRow extends React.PureComponent<ITransactionRowProps, {}> {
  public render() {
    const { transaction, onClick } = this.props;

    let icon;
    if (transaction.status === 'process') {
      icon = (
        <div className="transaction-icon">
          <Loader
            className="tx-icon"
            width={'17px'}
          />
        </div>
      );
    } else if (transaction.status === 'error') {
      icon = (
        <div className="transaction-icon">
          <InlineSVG
            className="error-icon"
            src={require('../../../../assets/img/common/dapp/status-error.svg')}
          />
        </div>
      );
    }

    return (
      <div className="transaction-row">
        <div className="transaction-row-wrapper flex-v" onClick={onClick(transaction)}>
          <p className="transaction-time">{formatTime(transaction.execution_datetime)}</p>
          {icon}
          <p className={classNames('transaction-description', { error: transaction.status === 'error' })}>{transaction.function_title}</p>
          <div className="transaction-hash">
            <AddressString str={'tx_id' in transaction ? transaction.tx_id : '-----'} />
          </div>
        </div>
        <p className="transaction-buttons">
          <button
            onClick={() => copyTextToClipboard(transaction.tx_id)}
            className="round-btn copy-btn flex"
            type="button"
            aria-label="Copy"
          >
            <InlineSVG
              className="copy-icon"
              src={require('../../../../assets/img/common/components/copy.svg')}
            />
          </button>
          <a
            className="round-btn link flex"
            // href={`${getNetworkEtherscanAddress(dapp.network_id)}/tx/${transaction.tx_id}`}
            target="_blank"
            aria-label="Search etherscan"
          >
            <InlineSVG
              className="etherscan-icon"
              src={require('../../../../assets/img/common/etherscan.svg')}
            />
          </a>
        </p>
      </div>
    );
  }
}
