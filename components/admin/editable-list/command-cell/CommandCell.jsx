/* eslint-disable react/display-name */
import React from 'react';

function CommandCell({ cancel, enterEdit, save, editField }) {
	return (props) => {
		if (!props.dataItem) return null;

		return props.dataItem[editField] ? (
			<td>
				<button
					className="k-button"
					onClick={() => save(props.dataItem)}
				>
					Update
				</button>
				<button
					className="k-button"
					onClick={() => cancel(props.dataItem)}
				>
					Cancel
				</button>
			</td>
		) : (
			<td>
				<button
					className="k-button"
					onClick={() => enterEdit(props.dataItem)}
				>
					Edit
				</button>
			</td>
		);
	};
}

export default CommandCell;
