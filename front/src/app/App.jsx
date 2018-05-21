import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Header from './header/Header';
import Footer from './footer/Footer';
import Auth from './auth/Auth';
import Callback from './auth/callback/Callback';
import Store from './store/StoreContainer';
import MyDapps from './my-dapps/MyDappsContainer';
import Profile from './profile/Profile';
import Deploy from './deploy/DeployContainer';
import CtorAdd from './ctor-add/CtorAdd';
import Dashboard from './dashboard/DashboardContainer';
import Instance from './instances/InstanceContainer';
import Docs from './docs/Docs';
import InfoBlock from './common/InfoBlock';
import metamask from './common/img/metamask.png';
import { checkMetaMask } from '../helpers/eth';
import Page404 from './page-404/Page404';

import './App.less';

const handleAuthentication = ({ location }) => {
  if (/access_token|id_token|error/.test(location.hash)) {
    Auth.handleAuthentication();
  }
};

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      if (Auth.isAuthenticated()) {
        return <Component {...props} />;
      } else {
        Auth.login(window.location.pathname);

        return <Callback {...props} />;
      }
    }}
  />
);

class App extends Component {
  componentWillMount() {
    this.setState({});

    let metamaskStatus = false;

    setInterval(() => {
      if (metamaskStatus !== checkMetaMask()) {
        metamaskStatus = checkMetaMask();
        this.setState({ metamaskStatus });
      }
    }, 250);
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    const { metamaskStatus } = this.state;
    const isAuthenticated = Auth.isAuthenticated();
    const { profile, setUserProfile } = this.props;

    if (!isAuthenticated && profile) setUserProfile(null);
    if (isAuthenticated && !profile) {
      Auth.getProfile((err, newProfile) => {
        setUserProfile(newProfile);
      });
    }

    return (
      <div>
        {/* block 'Install metamask' */}
        {metamaskStatus === 'noMetamask' &&
          <InfoBlock className="install-block flex">
            <img src={metamask} alt="" />
            <p>To pay Ether you need a Metamask plugin.</p>
            <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
              target="_blanc">
              <button>Install for Chrome</button>
            </a>
          </InfoBlock>
        }

        <Route render={(props) => (
          <Header profile={profile} {...props} />
        )} />

        <Switch>
          <Route exact path="/" render={(props) => (
            <Store metamaskStatus={metamaskStatus} {...props} />
          )} />
          <Route path="/callback" render={(props) => {
            handleAuthentication(props);
            return <Callback {...props} />
          }} />
          <Route path="/docs/:docUri?" component={Docs} />

          <PrivateRoute path="/profile" component={props =>
            <Profile profile={profile} {...props} />}
          />

          <PrivateRoute exact path="/deploy/:ctorId" component={props =>
            <Redirect to={`/deploy/${props.match.params.ctorId}/${this.props.nextDeploy}`} />
          } />

          <PrivateRoute path="/deploy/:ctorId/:deployId" component={props =>
            <Deploy metamaskStatus={metamaskStatus} {...props} />
          } />

          <PrivateRoute path="/dashboard" component={props =>
            <Dashboard metamaskStatus={metamaskStatus} {...props} />
          } />
          <PrivateRoute path="/instance/:id" component={props =>
            <Instance metamaskStatus={metamaskStatus} {...props} />
          } />

          <PrivateRoute path="/ctor-add" component={props =>
            <CtorAdd {...props} />
          } />

          <PrivateRoute path="/constructors/:id/update" component={props =>
            <CtorAdd {...props} />
          } />

          <PrivateRoute path="/my-dapps" component={props =>
            <MyDapps metamaskStatus={metamaskStatus} {...props} />
          } />

          <Route component={props =>
            <Page404 {...props} />
          } />

        </Switch>

        <Route render={(props) => <Footer {...props} />} />
      </div>
    );
  }
}

export default App;
