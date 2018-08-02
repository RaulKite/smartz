import * as classNames from 'classnames';
import * as dateFormat from 'dateformat';
import * as React from 'react';
import InlineSVG from 'svg-inline-react';

import './PopupTransaction.less';


interface IPopupTransactionProps {
  isOpen: boolean;
  onClose: () => void;
  record: any;
}

export default class PopupTransaction extends React.PureComponent<IPopupTransactionProps, {}> {
  public render() {
    const { onClose, isOpen, record } = this.props;

    if (!isOpen) {
      return null;
    }

    window.scrollTo(0, 300);
    let isTransaction: boolean = 'tx_id' in record ? true : false;

    let result: any;
    if (isTransaction) {
      result = record.is_success
        ? < p className="result-status" >Success</p >
        : <p className="result-status error">{record.error}</p>;
    } else {
      result = record.is_success
        ? (
          <div>
            {record.result.map((result, i) =>
              <p
                key={i}
                className="result-status"
              >
                <span>{result.title}</span>
                <span>{result.value}</span>
              </p>,
            )}
          </div>
        )
        : <p className="result-status error">{record.error}</p>;

    }

    return (
      <div className="popup-transaction">

        {/* closer */}
        <button
          className="close"
          type="button"
          aria-label="Close"
          onClick={onClose}
        >
          <InlineSVG
            className="x-icon"
            src={require('../../../assets/img/common/x-icon.svg')}
          />
        </button>

        {/* content */}
        <div className="event">
          <p className={classNames('event-name', {
            error: !record.is_success,
            ok: record.is_success,
          })}>
            {record.function_title}
            <sup className="event-extra">{record.function_title}</sup>
          </p>
          <p className="event-description">{record.function_description}</p>
        </div>
        <ul className="event-list">
          {record.function_arguments.map((item, i) => {
            return (
              <li key={i} className="event-item">
                <p className="event-id">{item.title}</p>
                <p className="event-value">{item.value}</p>
              </li>
            );
          })}
        </ul>
        <div className="event-result">
          <p className="result-id">Result</p>
          {result}
        </div>
        <div className="event-info">
          <div className="event-time">
            <div className="event-data">
              <InlineSVG
                className="x-icon"
                src={require('../../../assets/img/common/v-long.svg')}
              />
              <p className="executed-time">
                Executed {dateFormat(new Date(record.execution_datetime), 'dddd d, yyyy "at" hh:MM:ss')}
              </p>
            </div>
            {isTransaction &&
              <div className="event-data">
                <InlineSVG
                  className="x-icon"
                  src={require('../../../assets/img/common/v-double.svg')}
                />
                <p className="executed-time">
                  Mined {dateFormat(new Date(record.mining_datetime), 'h:MM:ss')}
                </p>
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}
