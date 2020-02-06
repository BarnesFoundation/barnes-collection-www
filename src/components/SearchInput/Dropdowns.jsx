import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Icon from '../Icon';
import { addAdvancedFilter, removeAdvancedFilter } from '../../actions/filters';
import assets from '../../searchAssets.json';
import './dropdowns.css';

const DROPDOWN_TERMS = ['Culture', 'Year', 'Medium', 'Location', 'Copyright', 'Artist'];
const DROPDOWN_TERMS_MAP = {
    'Culture': assets.cultures,
    'Year': 'Lorem Ipsum', // TODO => populate this.
    'Medium': [], // TODO => populate this.
    'Location': Object.keys(assets.locations).map(key => ({ key })), 
    'Copyright': Object.values(assets.copyrights).map(key => ({ key })),
    'Artist': assets.artists,
};

/**
 * Regular dropdown list.
 * @see getDropdownContent
 * */
const DropdownList = ({ data, activeTerms, setActiveTerm }) => (
    <ul className='dropdown__list'>
        {data
            .filter(({ key }) => key) // Filter out null items.
            .map(({ key }) => {
                const isActiveItem = activeTerms.includes(key);

                let listItemClassNames = 'dropdown__list-item';
                if (activeTerms.includes(key)) listItemClassNames = `${listItemClassNames} ${listItemClassNames}--active`;

                return (
                    <li
                        key={key}
                        className={listItemClassNames}
                        onClick={() => setActiveTerm(key)}
                    >
                        <span>{key}</span>
                        {isActiveItem && <Icon svgId='icon-checkmark' classes='dropdown__icon' />}
                    </li>
                );
            }
        )}
    </ul>
);

/** Dropdown menu for filtering artwork. */
class DropdownMenus extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeItem: null,
            activeTerms: this.props.existingSelections || [],
        };

        console.log(this.props.existingSelections);
    };

    /**
     * Set active index to item clicked, if this is already the active index then reset to null.
     * @param {string} index - index of clicked item.
     */
    setActiveItem(term) {
        const { activeItem } = this.state;

        // If this is the current active item, reset to null.
        if (activeItem === term || term === null) {
            this.setState({ activeItem: null });
        } else {
            this.setState({ activeItem: term });
        }
    }

    /**
     * Add or remove selected term to filters.
     * @param {string} term - filter search term.
     */
    setActiveTerm = (term) => {
        const { activeItem, activeTerms } = this.state;
        const { addAdvancedFilter, removeAdvancedFilter } = this.props;

        // Create a filter to dispatch to redux store, this will be for the "Applied Filters" section.
        const filter = { filterType: activeItem, value: `${activeItem}: "${term}"`, term };

        // If we are removing an item, filter it out of the array, otherwise append it to the array.
        if (activeTerms.includes(term)) {
            removeAdvancedFilter(filter);
            this.setState({ activeTerms: activeTerms.filter(activeTerm => activeTerm !== term) });
        } else {
            addAdvancedFilter(filter);
            this.setState({ activeTerms: [...activeTerms, term] });
        }
    };

    /**
     * Get inner content for dropdown.
     * TODO => This generates a new element on every re-render, this should be a separate FC.
     * @param {string} term - name of clicked item.
     * @returns {JSX.Element} JSX to be rendered inside of Dropdown.
     */
    getDropdownContent = () => {
        const { activeItem, activeTerms } = this.state;
        const data = DROPDOWN_TERMS_MAP[activeItem];

        switch (activeItem) {
            case('Year'): {
                return <span>Lorem Ipsum</span>;
            };
            case('Colors'): {
                return <span>Lorem Ipsum</span>;
            };
            default: {
                return (
                    <DropdownList
                        data={data}
                        activeTerms={activeTerms}
                        setActiveTerm={this.setActiveTerm}
                    />
                )
            }
        }
    };

    // On mount, set up reset function for HOC that keeps track of clicking out of dropdown.
    componentWillMount() {
        const { setResetFunction } = this.props;
        setResetFunction(() => this.setActiveItem(null))
    }

    render() {
        const { activeItem } = this.state;

        return (
            <div className='dropdowns-menu'>
                {DROPDOWN_TERMS.map((term, i) => {
                    const isLastDropdown = i === DROPDOWN_TERMS.length - 1;
                    const isActiveItem = activeItem === term;

                    // If this is the last item, we want to remove the chevron and add a | before the item.
                    let buttonClassName = 'dropdowns-menu__button';
                    if (isLastDropdown) buttonClassName = `${buttonClassName} dropdowns-menu__button--last`;

                    // If this is the active item, we want to flip the chevron.
                    let iconClassName = 'dropdowns-menu__icon';
                    if (isActiveItem) iconClassName = `${iconClassName} dropdowns-menu__icon--active`;
                    
                    return (
                        <button
                            key={term}
                            className={buttonClassName}
                            onClick={() => this.setActiveItem(term)}
                        >
                            <span className='dropdowns-menu__button-content'>{term}</span>
                            {!isLastDropdown && <Icon svgId='-icon_arrow_down' classes={iconClassName} />}
                            {isActiveItem &&
                                // Prevent propogation of event to deselecting button with onClick.
                                <div
                                    className='dropdown'
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                >
                                    <div className='dropdown__header'>
                                        <span className='font-delta dropdown__header--text'>{term}</span>
                                        <Icon
                                            svgId='-icon_close'
                                            classes='dropdown__icon dropdown__icon--x'
                                            onClick={() => this.setActiveItem(null)}
                                        />
                                    </div>
                                    <div className='dropdown__content'>
                                        {this.getDropdownContent()}
                                    </div>
                                </div>
                            }
                        </button>
                    );
                })}
            </div>
        )
    }
};

const mapStateToProps = state => ({
    existingSelections: Object.values(state.filters.advancedFilters) // Go over every key in advanced filter.
        .flatMap((value) => (Object.values(value)).map(({ term }) => term)) // Go through every object value and get the term, flatMap into single array.
});  
const mapDispatchToProps = dispatch => bindActionCreators(Object.assign({}, { addAdvancedFilter, removeAdvancedFilter }), dispatch);
const Dropdowns = connect(mapStateToProps, mapDispatchToProps)(DropdownMenus);

/** Component to keep track of clicking outside of menu. */
class ClickTracker extends Component {
    constructor(props) {
        super(props);

        this.ref = null; // Ref for wrapper div.

        // This will essentially be () => reset() for Dropdowns on cDM.
        this.state = { resetFunction: null };
    }

    // Listen to clicks outside of div and cleanup on unmount.
    componentDidMount() { document.addEventListener('mousedown', this.handleClick) }
    componentWillUnmount() { document.removeEventListener('mousedown', this.handleClick) }

    // On click outside of dropdown.
    handleClick = (event) => {
        const { resetFunction } = this.state;

        // If the ref is set up, the event is outside of the ref, and resetFunction was set in cDM.
        if (this.ref && !this.ref.contains(event.target) && resetFunction) {
            resetFunction(); // Reset on click out
        }
    };

    // Set reset function.
    setResetFunction = resetFunction => this.setState({ resetFunction });
    
    render() {
        return (
            <div ref={ref => this.ref = ref}>
                <Dropdowns setResetFunction={this.setResetFunction}/>
            </div>
        );
    }
}

export { ClickTracker as Dropdowns };
