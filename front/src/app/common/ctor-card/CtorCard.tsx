import * as React from 'react';
import { Link } from 'react-router-dom';
import InlineSVG from 'svg-inline-react';

import history from '../../../helpers/history';
import Auth from '../../auth/Auth';

import './CtorCard.less';


interface ICtorCardProps {
  ctor: any;
}

class CtorCard extends React.Component<ICtorCardProps, {}> {
  public render() {
    const { ctor } = this.props;

    const isAuthenticated = Auth.isAuthenticated();
    const userId = isAuthenticated && Auth.userProfile ? Auth.userProfile['user_id'] : -1;

    return (
      <article className="ctor-card">
        <Link to={`/deploy/${ctor.id}`} className="ctor-card__link screen">
          <div className="ctor-card__img flex">
            {ctor.image ? (
              <img src={require(`./img/${ctor.image}`)} alt={`${ctor.name} dapp`} />
            ) : (
                <div className="empty_img flex">
                  <p>{ctor.name.charAt(0).toUpperCase()}</p>
                </div>
              )}
          </div>
          <section className="ctor-card__description">
            <h2 className="ctor-card__header">{ctor.name}</h2>
            <p className="ctor-card__text">{ctor.description}</p>
          </section>
          <section className="ctor-card__controls">
            <div className="ctor-card__buttons">
              <div
                className="btn ctor-card__price"
                onClick={() => history.replace(`/deploy/${ctor.id}`)}
              >
                {ctor.price ? `${ctor.price} ETH` : 'Deploy free'}
              </div>

              {isAuthenticated &&
                ctor.user_id === userId && (
                  <div
                    className="btn ctor-card__price"
                    onClick={() => history.replace(`/constructors/${ctor.id}/update`)}
                  >
                    Update
                  </div>
                )}

              <div className="ctor-card__comp-count flex">
                <InlineSVG
                  className="count-img flex"
                  src={require('../../../assets/img/common/rocket.svg')}
                />
                <span className="text-count">{ctor.compilations_count}</span>
              </div>
            </div>
          </section>
        </Link>
      </article>
    );
  }
}

export default CtorCard;