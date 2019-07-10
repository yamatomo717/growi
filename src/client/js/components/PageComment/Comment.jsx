import React from 'react';
import PropTypes from 'prop-types';

import dateFnsFormat from 'date-fns/format';

import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';

import { createSubscribedElement } from '../UnstatedUtils';
import RevisionBody from '../Page/RevisionBody';
import UserPicture from '../User/UserPicture';
import Username from '../User/Username';

/**
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 * @export
 * @class Comment
 * @extends {React.Component}
 */
class Comment extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      html: '',
      isLayoutTypeGrowi: false,
    };

    this.isCurrentUserIsAuthor = this.isCurrentUserEqualsToAuthor.bind(this);
    this.isCurrentRevision = this.isCurrentRevision.bind(this);
    this.getRootClassName = this.getRootClassName.bind(this);
    this.getRevisionLabelClassName = this.getRevisionLabelClassName.bind(this);
    this.deleteBtnClickedHandler = this.deleteBtnClickedHandler.bind(this);
    this.editBtnClickedHandler = this.editBtnClickedHandler.bind(this);
    this.renderText = this.renderText.bind(this);
    this.renderHtml = this.renderHtml.bind(this);
  }

  componentWillMount() {
    this.renderHtml(this.props.comment.comment);
    this.init();
  }

  init() {
    const layoutType = this.props.appContainer.getConfig().layoutType;
    this.setState({ isLayoutTypeGrowi: layoutType === 'crowi-plus' || layoutType === 'growi' });
  }

  componentWillReceiveProps(nextProps) {
    this.renderHtml(nextProps.comment.comment);
  }

  // not used
  setMarkdown(markdown) {
    this.renderHtml(markdown);
  }

  isCurrentUserEqualsToAuthor() {
    return this.props.comment.creator.username === this.props.appContainer.me;
  }

  isCurrentRevision() {
    return this.props.comment.revision === this.props.pageContainer.state.revisionId;
  }

  getRootClassName() {
    return `page-comment ${
      this.isCurrentUserEqualsToAuthor() ? 'page-comment-me ' : ''}`;
  }

  getRevisionLabelClassName() {
    return `page-comment-revision label ${
      this.isCurrentRevision() ? 'label-primary' : 'label-default'}`;
  }

  deleteBtnClickedHandler() {
    this.props.deleteBtnClicked(this.props.comment);
  }

  editBtnClickedHandler() {
    this.props.editBtnClicked();
  }

  renderText(comment) {
    return <span style={{ whiteSpace: 'pre-wrap' }}>{comment}</span>;
  }

  renderRevisionBody() {
    const config = this.props.appContainer.getConfig();
    const isMathJaxEnabled = !!config.env.MATHJAX;
    return (
      <RevisionBody
        html={this.state.html}
        isMathJaxEnabled={isMathJaxEnabled}
        renderMathJaxOnInit
        additionalClassName="comment"
      />
    );
  }

  toggleOlderReplies() {
    this.setState((prevState) => {
      return {
        showOlderReplies: !prevState.showOlderReplies,
      };
    });
  }

  renderHtml(markdown) {
    const context = {
      markdown,
    };

    const growiRenderer = this.props.growiRenderer;
    const interceptorManager = this.props.appContainer.interceptorManager;
    interceptorManager.process('preRenderComment', context)
      .then(() => { return interceptorManager.process('prePreProcess', context) })
      .then(() => {
        context.markdown = growiRenderer.preProcess(context.markdown);
      })
      .then(() => { return interceptorManager.process('postPreProcess', context) })
      .then(() => {
        const parsedHTML = growiRenderer.process(context.markdown);
        context.parsedHTML = parsedHTML;
      })
      .then(() => { return interceptorManager.process('prePostProcess', context) })
      .then(() => {
        context.parsedHTML = growiRenderer.postProcess(context.parsedHTML);
      })
      .then(() => { return interceptorManager.process('postPostProcess', context) })
      .then(() => { return interceptorManager.process('preRenderCommentHtml', context) })
      .then(() => {
        this.setState({ html: context.parsedHTML });
      })
      // process interceptors for post rendering
      .then(() => { return interceptorManager.process('postRenderCommentHtml', context) });

  }

  renderReplies() {
    const isLayoutTypeGrowi = this.state.isLayoutTypeGrowi;
    let replyList = this.props.replyList;
    if (!isLayoutTypeGrowi) {
      replyList = replyList.slice().reverse();
    }

    const areThereHiddenReplies = replyList.length > 2;

    const iconForOlder = <i className="icon-options-vertical"></i>;
    const toggleOlder = areThereHiddenReplies
      ? (
        <a className="page-comments-list-toggle-older text-center" data-toggle="collapse" href="#page-comments-list-older">
          {iconForOlder} Read More
        </a>
      )
      : <div></div>;

    const shownReplies = replyList.slice(replyList.length - 2, replyList.length);
    const hiddenReplies = replyList.slice(0, replyList.length - 2);

    const toggleElements = hiddenReplies.map((reply) => {
      return (
        <div key={reply._id} className="col-xs-offset-1 col-xs-11 col-sm-offset-1 col-sm-11 col-md-offset-1 col-md-11 col-lg-offset-1 col-lg-11">
          <CommentWrapper
            comment={reply}
            deleteBtnClicked={this.props.deleteBtnClicked}
            growiRenderer={this.props.growiRenderer}
            replyList={[]}
          />
        </div>
      );
    });

    const toggleBlock = (
      <div className="page-comments-list-older collapse out" id="page-comments-list-older">
        {toggleElements}
      </div>
    );

    const shownBlock = shownReplies.map((reply) => {
      return (
        <div key={reply._id} className="col-xs-offset-1 col-xs-11 col-sm-offset-1 col-sm-11 col-md-offset-1 col-md-11 col-lg-offset-1 col-lg-11">
          <CommentWrapper
            comment={reply}
            deleteBtnClicked={this.props.deleteBtnClicked}
            growiRenderer={this.props.growiRenderer}
            replyList={[]}
          />
        </div>
      );
    });

    return (
      <div>
        {toggleBlock}
        {toggleOlder}
        {shownBlock}
      </div>
    );
  }

  render() {
    const comment = this.props.comment;
    const creator = comment.creator;
    const isMarkdown = comment.isMarkdown;

    const rootClassName = this.getRootClassName();
    const commentDate = dateFnsFormat(comment.createdAt, 'YYYY/MM/DD HH:mm');
    const commentBody = isMarkdown ? this.renderRevisionBody() : this.renderText(comment.comment);
    const revHref = `?revision=${comment.revision}`;
    const revFirst8Letters = comment.revision.substr(-8);
    const revisionLavelClassName = this.getRevisionLabelClassName();

    const { revisionId, revisionCreatedAt } = this.props.pageContainer.state;

    let isNewer;
    if (comment.revision === revisionId) {
      isNewer = 'page-comments-list-current';
    }
    else if (Date.parse(comment.createdAt) / 1000 > revisionCreatedAt) {
      isNewer = 'page-comments-list-newer';
    }
    else {
      isNewer = 'page-comments-list-older';
    }


    return (
      <div>
        <div className={isNewer}>
          <div className={rootClassName}>
            <UserPicture user={creator} />
            <div className="page-comment-main">
              <div className="page-comment-creator">
                <Username user={creator} />
              </div>
              <div className="page-comment-body">{commentBody}</div>
              <div className="page-comment-meta">
                {commentDate}&nbsp;
                <a className={revisionLavelClassName} href={revHref}>{revFirst8Letters}</a>
              </div>
              <div className="page-comment-control">
                <button type="button" className="btn btn-link" onClick={this.editBtnClickedHandler}>
                  <i className="ti-pencil"></i>
                </button>
                <button type="button" className="btn btn-link" onClick={this.deleteBtnClickedHandler}>
                  <i className="ti-close"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="container-fluid">
          <div className="row">
            {this.renderReplies()}
          </div>
        </div>
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const CommentWrapper = (props) => {
  return createSubscribedElement(Comment, props, [AppContainer, PageContainer]);
};

Comment.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  comment: PropTypes.object.isRequired,
  growiRenderer: PropTypes.object.isRequired,
  deleteBtnClicked: PropTypes.func.isRequired,
  editBtnClicked: PropTypes.func.isRequired,
  replyList: PropTypes.array,
};

export default CommentWrapper;
