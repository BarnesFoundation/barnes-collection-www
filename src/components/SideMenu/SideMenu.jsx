import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { htmlClassesRemove } from '../../actions/htmlClassManager';
import { MAIN_WEBSITE_DOMAIN, CLASSNAME_NAV_ACTIVE} from '../../constants';
import './SideMenu.css';

/**
 * Default side menu for navigation.
 * If there is children for @see SideMenu.jsx, this is not rendered.
 */
const DefaultSideMenu = () => (
  <nav className='g-nav__links' aria-labelledby='g-nav__title'>
    <div className='g-nav__important-links'>
      <a
        className='g-nav__link g-nav__link--important'
        href={MAIN_WEBSITE_DOMAIN + '/whats-on'}
      >
        <span>What’s On</span>
      </a>
      <a
        className='g-nav__link g-nav__link--important'
        href={MAIN_WEBSITE_DOMAIN + '/plan-your-visit'}
      >
        <span>Plan your Visit</span>
      </a>
      <a
        className='g-nav__link g-nav__link--important' aria-current='true'
        href='/'
      >
        <span>Our Collection</span>
      </a>
      <a
        className='g-nav__link g-nav__link--important'
        href={MAIN_WEBSITE_DOMAIN + '/classes'}
      >
        <span>Take a Class</span>
      </a>
    </div>
    <a
      className='g-nav__link'
      href={MAIN_WEBSITE_DOMAIN + '/about'}
    >
      <span>About</span>
    </a>
    <a
      className='g-nav__link'
      href={MAIN_WEBSITE_DOMAIN + '/support'}
    >
      <span>Join</span>
    </a>
    <a
      className='g-nav__link'
      href={MAIN_WEBSITE_DOMAIN + '/support/individual-giving'}
    >
      <span>Give</span>
    </a>
    <a
      className='g-nav__link'
      href={MAIN_WEBSITE_DOMAIN + '/teachers'}
    >
      <span>Teachers</span>
    </a>
    <a
      className='g-nav__link'
      href={MAIN_WEBSITE_DOMAIN + '/press'}
    >
      <span>Press</span>
    </a>
    <a
      className='g-nav__link'
      href={'https://shop.barnesfoundation.org' + '/'}
    >
      <span>Shop</span>
    </a>
    <a
      className='g-nav__link'
      href={MAIN_WEBSITE_DOMAIN + '/host-an-event'}
    >
      <span>Facility Rental</span>
    </a>
    <a
      className='g-nav__link'
      href={MAIN_WEBSITE_DOMAIN + `/whats-on/arboretum`}
    >
      <span>Arboretum</span>
    </a>
  </nav>
);

/**
 * Side menu component.
 * TODO => Add TRANSITION GROUPS. 
 */
class SideMenu extends Component {
  constructor(props) {
    super(props);

    this.ref = null;
  }

  /**
   * On cDM, if this isOpen, translate left.
   */
  componentDidMount() {
    if (this.props.isOpen) this.ref.style.transform = 'translate3d(-100%, 0, 0)';
  }

  /**
   * On update, if the isOpen prop has changed then place back.
   */
  componentWillUpdate(prevProps) {
    if (prevProps.isOpen !== this.props.isOpen) {
      this.ref.style.transform = `translate3d(${this.props.isOpen ? '0' : '-100%'}, 0, 0)`;
    }
  }

  render() {
    const { resetLock, closeMenu, isOpen, children } = this.props;

    const handleNavCloseBtnClick = (e) => {
      e.preventDefault();
      resetLock();
      closeMenu();
    };

    let sideMenuClassNames = 'side-menu';
    if (isOpen) sideMenuClassNames = `${sideMenuClassNames} side-menu--active`;

    let gNavClassNames = 'g-nav';
    if (children) gNavClassNames = `${gNavClassNames} g-nav--custom`

    return (
      <div className={sideMenuClassNames}>
        <div
          className={gNavClassNames}
          data-behavior='nav'
          tabIndex={-1}
          ref={ref => this.ref = ref}
        >
          <div
            className='g-nav__inner'
            onClick={(e) => {
              // Prevent cancellation from propagating in Dropdowns.jsx.
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <button
              onClick={handleNavCloseBtnClick}
              className='g-nav__close btn btn--icon-only html4-hidden'
              type='button'
              aria-labelledby='nav-close-title'
              data-nav-hide
            >
              <svg className='icon--close' width={20} height={20}>
                <title id='nav-close-title'>Close menu</title>
                <use xlinkHref='#icon--icon_close' />
              </svg>
            </button>
            <h2 className='visuallyhidden' id='g-nav__title'>Main menu</h2>
            {children || <DefaultSideMenu />}
          </div>
        </div>
        <div
          onClick={handleNavCloseBtnClick}
          className='g-nav-overlay'
          data-nav-overlay
        ></div>
      </div>
    );
  };
}

const mapStateToProps = state => ({ htmlClassManager: state.htmlClassManager });
const mapDispatchToProps = dispatch => (
  bindActionCreators(Object.assign({}, { htmlClassesRemove }), dispatch)
);

const ConnectedSideMenu = connect(mapStateToProps, mapDispatchToProps)(SideMenu);

/** HOC to lock scroll in place. */
class LockScroll extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scrollY: 0,
    };
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.isOpen !== this.props.isOpen) {
      this.setUpScrollLock(this.props.isOpen);
    }
  }

  componentDidMount() {
    this.setUpScrollLock(this.props.isOpen);
  }

  componentWillUnmount() {
    this.setUpScrollLock(false);
  }

  /**
   * On update, access a17 and root to lock scrollbar in place
   * TODO => Rewrite this in a more declarative style, not accessing DOM elements imperatively.
   * @param {boolean} isLock - if scroll should be locked.
   * */
  setUpScrollLock(isLock) {
    const windowScrollY = window.pageYOffset;

    if (isLock) { // On menu appearing, set up where the scroll was.
      this.setState({ scrollY: window.pageYOffset });
    }

    document.getElementById('root').style.position = isLock ? 'absolute' : null;
    document.getElementById('root').style.width = isLock ? '100%' : null
    document.getElementById('root').style.top = isLock ? `-${windowScrollY}px` : null;
    document.getElementById('a17').style.height = isLock ? '100vh' : null;
    document.getElementById('a17').style.overflow = isLock ? 'hidden' : null;

    if (!isLock) { // On menu disappearing, scroll down to where saved state is.
      window.scrollTo(0, this.state.scrollY);
    }
  }

  render() {
    return (
    <ConnectedSideMenu
      {...this.props}
      resetLock={() => this.setUpScrollLock(false)}
    />
    )
  }
}

export { LockScroll as SideMenu };