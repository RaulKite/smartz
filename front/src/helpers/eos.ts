import axios from 'axios';
import * as binaryen from 'binaryen';
import * as Eos from 'eosjs';
import { find } from 'lodash';

import { eosConstants } from '../constants/constants';
import { getFuncType } from './common';


declare global {
  // tslint:disable-next-line:interface-name
  interface Window {
    scatter: any;
  }
}

class EosClass {
  private network: any;
  private eos: any;
  private identity: any;
  private url: string;

  public configEosDapp: any;
  public accountName: any;
  public scatter: any = window.scatter;
  public currentIdentity: any;

  constructor() {
    document.addEventListener('scatterLoaded', (scatterExtension) => {
      this.scatter = window.scatter;
      window.scatter = null;
    });
    this.identity = null;
    this.eos = null;
    this.currentIdentity = null;
    this.identity = null;
    this.accountName = null;
    this.network = {
      port: eosConstants.PORT,
      host: eosConstants.HOST,
      blockchain: eosConstants.BLOCKCHAIN,
      protocol: eosConstants.PROTOCOL,
    };
    this.url = eosConstants.PROTOCOL + '://' + eosConstants.HOST + ':' + eosConstants.PORT;

    this.configEosDapp = {
      binaryen,
      // mockTransactions: () => null,
    };

    this.sendTransaction = this.sendTransaction.bind(this);
    this.getAccountName = this.getAccountName.bind(this);
    this.setChainId = this.setChainId.bind(this);
    this.executeFunc = this.executeFunc.bind(this);
    this.getIdentity = this.getIdentity.bind(this);
  }

  public setChainId() {
    return new Promise((resolve, reject) => {
      if (!this.configEosDapp.chainId) {
        axios
          .get(this.url + '/v1/chain/get_info')
          .then((result) => {
            if (result.status === 200) {
              this.network.chainId = result.data.chain_id;
              this.configEosDapp.chainId = result.data.chain_id;
              this.network['chainId'] = result.data.chain_id;

              resolve();
            }
          })
          .catch((error) => reject(error));
      } else {
        return resolve();
      }
    });
  }

  public getAccountName(identity) {
    if (identity.accounts && Array.isArray(identity.accounts) && identity.accounts.length > 0) {
      return identity.accounts[0].name;
    } else {
      throw Error('Account not found!');
    }
  }

  public forgetIdentity() {
    return new Promise((resolve) => {
      if (this.scatter.identity)
        this.scatter.forgetIdentity()
          .then(() => resolve());
      else
        resolve();
    });
  }

  public chooseIdentity() {
    this.scatter.requireVersion(5.0);

    return (
      this.setChainId()
        // accept current network
        .then(() => this.forgetIdentity())
        .then(() => this.scatter.suggestNetwork(this.network))
        .then(() => this.scatter.getIdentity({ accounts: [this.network] }))
    );
  }

  public deployContract = (bin: string, abi: any) => {
    this.scatter.requireVersion(5.0);

    return (
      this.setChainId()
        // accept current network
        .then(() => this.forgetIdentity())
        .then(() => this.scatter.suggestNetwork(this.network))
        .then(() => this.scatter.getIdentity({ accounts: [this.network] }))
        .then((identity) => {
          this.currentIdentity = identity;
          this.accountName = this.getAccountName(identity);

          // send smart-contract code
          return this.scatter
            .eos(this.network, Eos, this.configEosDapp, this.network.protocol)
            .setcode(this.accountName, 0, 0, bin);
        })
        .then(() => {
          // send smart-contract abi
          return this.scatter
            .eos(this.network, Eos, this.configEosDapp, this.network.protocol)
            .setabi(this.accountName, abi);
        })
    );
  }

  public setPermissions = (permissions: any) => {
    this.scatter.requireVersion(5.0);

    return (
      this.setChainId()
        // accept current network
        .then(() => this.forgetIdentity())
        .then(() => this.scatter.suggestNetwork(this.network))
        .then(() => this.scatter.getIdentity({ accounts: [this.network] }))
        .then((identity) => {
          this.currentIdentity = identity;
          this.accountName = this.getAccountName(identity);

          // obtain current permissions
          return this.scatter
            .eos(this.network, Eos, this.configEosDapp, this.network.protocol)
            .getAccount({ account_name: this.accountName });
        })
        .then((account) => {
          let perms = permissions.map((p: any) => {
            return {
              permission: {
                actor: !p.actor ? this.accountName : p.actor,
                permission: p.name,
              },
              weight: 1,
            };
          });

          let payload = {
            parent: 'owner',
            permission: 'active',
            account: this.accountName,
            auth: account.permissions[0].required_auth,
          };

          let hasPermission = (perm: any) => {
            for (let i = 0; i < payload.auth.accounts.length; ++i) {
              if (payload.auth.accounts[i].permission.actor === perm.permission.actor &&
                payload.auth.accounts[i].permission.permission === perm.permission.permission
              )
                return true;
            }
            return false;
          };

          let needUpdate = false;
          perms.forEach((perm: any) => {
            if (!hasPermission(perm)) {
              payload.auth.accounts.push(perm);
              needUpdate = true;
            }
          });

          if (!needUpdate)
            return Promise.resolve();

          return this.scatter
            .eos(this.network, Eos, this.configEosDapp, this.network.protocol)
            .transaction('eosio', (system) => {
              system.updateauth(payload, { authorization: this.accountName });
            });
        })
    );
  }

  public getIdentity() {
    return this.scatter.getIdentity({ accounts: [this.network] });
  }

  public sendTransaction(address: any, func: any, formData: any) {
    return new Promise((resolve, reject) => {
      this.setChainId()
        .then(() => this.forgetIdentity())
        .then(() => this.scatter.suggestNetwork(this.network))
        .then(() => this.scatter.getIdentity({ accounts: [this.network] }))
        .then((identity) => {
          this.currentIdentity = identity;

          this.accountName = this.getAccountName(identity);

          this.eos = this.scatter.eos(this.network, Eos, this.configEosDapp);

          return this.eos.transaction(address, (contract) => {
            contract[func.name](...formData, { authorization: this.accountName });
          });
        })
        .then((response) => resolve(response))
        .catch((error) => reject(error));
    });
  }

  public readTable(address: any, tableKey: any, func: any, formData: any) {
    return new Promise((resolve, reject) => {
      this.setChainId()
        .then(() => this.scatter.getIdentity({ accounts: [this.network] }))
        .then((identity) => {
          this.accountName = this.getAccountName(identity);

          this.eos = this.scatter.eos(this.network, Eos, this.configEosDapp);

          return this.eos.getTableRows({
            json: true,
            code: address,
            scope: address,
            table: func.name,
            table_key: tableKey,
            lower_bound: formData[0],
            limit: 1,
          });
        })
        .then((result) => {
          resolve({
            result,
            func,
            formData,
          });
        })
        .catch((error) => reject(error));
    });
  }

  public executeFunc(abi: any, func: any, address: any, formData: any) {
    return new Promise((resolve, reject) => {
      switch (getFuncType(func)) {
        case 'write':
          this.sendTransaction(address, func, formData)
            .then((result) => resolve(result))
            .catch((error) => reject(error));
          break;
        case 'ask':
          const table = find(abi.tables, { name: func.name });
          const tableKey = table.key_names[0];

          this.readTable(address, tableKey, func, formData)
            .then((data: any) => {
              const rows = data.result.rows;

              if (rows.length > 0 && data.formData[0].toString() === rows[0][tableKey].toString()) {
                resolve(data.result.rows[0]);
              } else {
                throw {
                  error: { what: 'Not found' },
                };
              }
            })
            .catch((error) => reject(error));
          break;
        case 'view':
          return null;
        default:
          break;
      }
    });
  }
}

export default new EosClass();
