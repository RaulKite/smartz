import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { find } from 'lodash';

import Dapp from './Dapp';
import { viewFuncResult } from './DappsActions';

const mapStateToProps = (state, ownProps) => {
  const dapp = find(state.dapps.dapps, { instance_id: ownProps.match.params.id });

  return {
    dapp: dapp,
    dappError: state.dapps.error
  };
};

const mapDispatchToProps = { viewFuncResult };

const DappContainer = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Dapp)
);

export default DappContainer;