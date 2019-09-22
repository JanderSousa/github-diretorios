/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/static-property-placement */
/* eslint-disable react/state-in-constructor */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, Filter } from './styles';

// import { Container } from './styles';

export default class Repository extends Component {
  static propTypes = {
    macth: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    state: 'open',
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { page, state } = this.state;
    const repoName = decodeURIComponent(match.params.repository);
    this.loadIssues(repoName, page, state);
  }

  loadIssues = async (repoName, page, state) => {
    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state,
          page,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
      page,
      state,
    });
  };

  handleChangeFilter = e => {
    const state = e.target.value;
    const { page } = this.state;
    const { repository } = this.props.match.params;
    const repoName = decodeURIComponent(repository);
    this.loadIssues(repoName, page, state);
  };

  handleChangePage = action => {
    const { page } = this.state;
    const newPage = action === 'previous' ? page - 1 : page + 1;
    const { repository } = this.props.match.params;
    const repoName = decodeURIComponent(repository);
    const { state } = this.state;
    this.loadIssues(repoName, newPage, state);
  };

  render() {
    const { repository, issues, loading, state, page } = this.state;

    if (loading) {
      return <Loading>Carregando...</Loading>;
    }
    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <Filter pageOne={page === 1}>
          <div className="div-filter">
            Estado
            <select value={state} onChange={this.handleChangeFilter}>
              <option value="open">Aberto</option>
              <option value="closed">Fechado</option>
              <option value="all">Todos</option>
            </select>
          </div>
          <div>
            <button
              className="button-previous"
              type="button"
              disabled={page < 2}
              onClick={() => this.handleChangePage('previous')}
            >
              Anterior
            </button>
            <button type="button" onClick={() => this.handleChangePage('next')}>
              Próxima
            </button>
          </div>
        </Filter>

        <IssueList>
          {issues.map(issue => (
            <li key={issue.id}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}
