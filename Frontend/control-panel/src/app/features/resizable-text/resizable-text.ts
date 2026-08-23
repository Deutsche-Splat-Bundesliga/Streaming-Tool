import {
  afterRenderEffect,
  Component,
  ElementRef,
  input,
  InputSignal,
  OnDestroy,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';

@Component({
  selector: 'app-resizable-text',
  imports: [],
  templateUrl: './resizable-text.html',
  styleUrl: './resizable-text.scss',
})
export class ResizableText implements OnDestroy {
  /**
   * Text svg element to calculate dynamic text size correctly when text overflows
   */
  @ViewChild('svgText') private _svgText?: ElementRef;

  /**
   * Input signal for text to display
   */
  resizableTextContent: InputSignal<string> = input<string>('');

  /**
   * Input signal for aspect ratio that handles text alignment
   */
  aspectRatio: InputSignal<string> = input<string>('xMinYMid meet');

  /**
   * Signal for viewbox size to adjust it dynamically
   */
  viewBoxSize: WritableSignal<number[]> = signal<number[]>([0, 0, 0, 0]);

  /**
   * Effect that calculates the bounding box of our text element and sets it on the svg container
   */
  private _resizeTextEffect = afterRenderEffect(() => {
    // Call resizable text content signal here to trigger effect
    this.resizableTextContent();

    if (!this._svgText) return;

    const bbox = this._svgText.nativeElement.getBBox();
    this.viewBoxSize.set([bbox.x, bbox.y, bbox.width, bbox.height]);
  });

  /**
   * Destroy all effects on component
   */
  ngOnDestroy(): void {
    this._resizeTextEffect.destroy();
  }

  /**
   * Get text content from input effect
   */
  get textContent(): string {
    if (typeof this.resizableTextContent !== 'function') return '';

    return this.resizableTextContent();
  }

  /**
   * Get the the aspect ratio attribute value to set for the svg container from input effect
   */
  get aspectRatioContent(): string {
    if (typeof this.aspectRatio !== 'function') return '';

    return this.aspectRatio();
  }
}
