import * as PropTypes from 'prop-types';
import * as React from 'react';
import { findNodeHandle, MeasureOnSuccessCallback, NativeModules, View, ViewStyle } from 'react-native';
import { Rect } from './PopoverGeometry';

export interface Props {
  onPopoverDisplayed?: () => any;
  style?: ViewStyle,
}

export interface State {
  showPopover: boolean;
  popoverAnchor: Rect;
}

class PopoverTouchable extends React.PureComponent<Props, State> {

  static propTypes = {
    onPopoverDisplayed: PropTypes.func,
    style: PropTypes.any,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      showPopover: false,
      popoverAnchor: { x: 0, y: 0, width: 0, height: 0 },
    };
  }

  private touchable: any = null;

  private setRef = (ref: any) => {
    this.touchable = ref;
  };

  private onPress = () => {
    const handle = findNodeHandle(this.touchable);
    if (handle) {
      NativeModules.UIManager.measure(handle, this.onTouchableMeasured);
    }
  };

  private onTouchableMeasured: MeasureOnSuccessCallback = (x0, y0, width, height, x, y) => {
    this.setState(
      {
        showPopover: true,
        popoverAnchor: { x, y, width, height },
      },
      () => {
        if (this.props.onPopoverDisplayed) {
          this.props.onPopoverDisplayed();
        }
      },
    );
  };

  private onClosePopover = () => this.setState({ showPopover: false });

  render() {
    const children = React.Children.toArray(this.props.children);
    if (
      children.length !== 2 ||
      children[1] instanceof Number ||
      children[1] instanceof String ||
      (children[1] as any).type.displayName !== 'Popover'
    ) {
      throw new Error('Popover touchable must have two children and the second one must be Popover');
    }
    return (
      <View style={this.props.style}>
        {
          React.cloneElement(children[0] as React.ReactElement<any>, {
            ref: this.setRef,
            onPress: this.onPress,
          })
        }
        {
          React.cloneElement(children[1] as React.ReactElement<any>, {
            visible: this.state.showPopover,
            onClose: this.onClosePopover,
            fromRect: this.state.popoverAnchor,
          })
        }
      </View>
    );
  }
}

export default PopoverTouchable;
