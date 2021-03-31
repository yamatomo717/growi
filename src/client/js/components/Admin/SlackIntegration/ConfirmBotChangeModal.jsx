import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
// import { useTranslation } from 'react-i18next';

const ConfirmBotChangeModal = ({ show, onButtonClick }) => {
  // const { t } = useTranslation();
  const dialog = useRef({});
  useEffect(() => {
    $(dialog.current).modal(show ? 'show' : 'hide');
  }, [show]);
  useEffect(() => {
    $(dialog.current).on('hide.bs.modal', () => onButtonClick('close'));
  }, [onButtonClick]);

  return (
    <div className="modal fade" ref={dialog} id="modalDialog" tabIndex="-1" role="dialog" aria-labelledby="modalDialogLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="modalDialogLabel">
              Warning
            </h5>
            <button type="button" className="close" aria-label="Close" onClick={() => onButtonClick('close')}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div className="modal-body">
            <div>
              <h4>Are you sure you want to change the bot type?</h4>
            </div>
            <div>
              <p>Settings from other bots will be deleted.</p>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => onButtonClick('close')}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={() => onButtonClick('change')}>
              Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ConfirmBotChangeModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onButtonClick: PropTypes.func.isRequired,
};

export default ConfirmBotChangeModal;
