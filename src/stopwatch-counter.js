import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/iron-collapse/iron-collapse.js';
// eslint-disable-next-line max-len
import {NeonAnimationRunnerBehavior} from '@polymer/neon-animation/neon-animation-runner-behavior.js';

import './iron-icons.js';

// eslint-disable-next-line max-len
class StopwatchCounter extends mixinBehaviors([NeonAnimationRunnerBehavior], PolymerElement) {
  /* eslint-disable */
  static get template() {
    return html`<style>
    :host {
        display: block;
        width: 320px;
        position: relative;
        margin: 15px 0 0;
    }

    paper-card:not(.running):not(.opened) {
        /*noinspection CssInvalidFunction*/
        color: var(--secondary-text-color);
    }

    paper-card:not(.running):not(.opened) .card-actions {
        /*noinspection CssInvalidFunction*/
        border-color: var(--secondary-text-color);
    }

    .card-content .value {
        font-size: 36px;
        line-height: 1;
        text-align: center; }

    .card-content .name {
        min-height: 20px;
        margin-bottom: -20px; }

    .btn {
        display: block; }

    .icon {
        height: 36px;
        width: 36px; }

    .info {
        overflow: hidden;
        padding: 0 15px; }

    .btn-delete {
        position: absolute;
        top: 60px;
        right: 5px;
        width: 35px;
        height: 35px;
        visibility: hidden;
        opacity: 0;
        transition: top 300ms ease-out, opacity 300ms ease-out; }

    .expand-icon {
        transition: transform 300ms; }

    .running .play-icon {
        display: none; }

    paper-card {
        display: block;
        transition: color 100ms; }

    paper-card:not(.running) .pause-icon {
        display: none; }

    paper-card.new .second-buttons {
        display: none; }

    paper-card.ready .stop-btn, paper-card.ready .lap-btn {
        display: none; }

    paper-card.opened .btn-delete {
        visibility: visible;
        top: 5px;
        opacity: 1; }

    paper-card.opened .expand-icon {
        transform: rotateZ(180deg); }

    paper-card .card-actions {
        transition: border-color 100ms; }

    .buttons-group {
        display: flex;
        text-align: center;
    }

    .buttons-group .btn:nth-child(1) {
        flex-grow: 1;
    }

    .laps-wrapper {
        overflow: hidden; }

    stopwatch-lap {
        display: block;
        position: relative;
        width: 152px; }

    stopwatch-lap .shift {
        position: absolute;
        transform: translateX(-100%) translateY(15px); }

    stopwatch-lap:nth-last-of-type(1) {
        margin-bottom: 15px; }

    .history-list {
        list-style: none; }

    .laps {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
    }

    @media (min-width: 400px) {
        :host {
            margin: 15px auto 0; }
    }

    @media (max-width: 767px) {
        paper-card .card-actions {
            padding-left: 0;
            padding-right: 0; }
    }

    @media (min-width: 768px) {
        :host {
            width: 352px;
            margin: 15px 15px 0; }
    }
</style>
<iron-icons></iron-icons>
<paper-card id="wrapper" class$="{{getStatus(run, meted, history)}}">
    <div class="card-content">
        <div class="value" title="[[asMinutes(value)]]">[[format(value)]]</div>
        <div class="name">[[name]]</div>
    </div>
    <div class="card-actions">
        <div class="buttons-group">
            <paper-button class="btn primary-button" on-click="toggle">
                <iron-icon class="icon play-icon" icon="mi:play-arrow"></iron-icon>
                <iron-icon class="icon pause-icon" icon="mi:pause"></iron-icon>
            </paper-button>
            <paper-button class="btn second-buttons stop-btn" on-click="stop">
                <iron-icon class="icon" icon="mi:stop"></iron-icon>
            </paper-button>
            <paper-button class="btn second-buttons lap-btn" on-click="lap">
                <iron-icon class="icon" icon="mi:flag"></iron-icon>
            </paper-button>
            <paper-button class="btn second-buttons" data-action="info" on-click="moreInfo">
                <iron-icon class="icon expand-icon" icon="mi:expand-more"></iron-icon>
            </paper-button>
        </div>
    </div>
    <iron-collapse class="info" id="moreInfo">
        <paper-input label="Название счётчика" value="{{name}}" on-change="onNameChange"></paper-input>

        <template is="dom-repeat" items="[[getGroupedHistory(history.*)]]">
            [[item.day]]<br>
            <ol class="history-list">
                <template is="dom-repeat" items="[[item.history]]">
                    <li>{{item}}</li>
                </template>
            </ol>
        </template>
    </iron-collapse>
    <div class="laps-wrapper">
        <div class="laps" id="laps">
            <template is="dom-repeat" items="{{laps}}">
                <stopwatch-lap value="{{item.value}}" shift="{{item.shift}}"></stopwatch-lap>
            </template>
        </div>
    </div>
    <paper-icon-button icon="mi:delete" class="btn-delete" on-click="delete"></paper-icon-button>
</paper-card>    
    `;
  }

  /* eslint-enable */
  static get properties() {
    return {
      value: {
        type: Number,
        computed: 'getValue(run, beginning, meted, timestamp)',
      },
      beginning: {
        type: Number,
        notify: true,
      },
      run: {
        type: Boolean,
        notify: true,
      },
      name: {
        type: String,
        notify: true,
      },
      meted: {
        type: Number,
        notify: true,
      },
      timestamp: {
        type: Number,
        value: Date.now(),
      },
      laps: Array,
    };
  }

  ready() {
    super.ready();
    this.isNew = true;
  }

  connectedCallback() {
    if (this.isNew) {
      const aConf = {
        y: '100%',
      };
      if ((this.previousSibling != null)
          && this.offsetTop === this.previousSibling.offsetTop) {
        aConf.marginRight = -1 * this.offsetWidth + 'px';
      }
      TweenLite.from(this, 0.4, aConf);
      this.isNew = false;
    }
    return this.timer();
  }

  format(duration) {
    if (!moment.isDuration(duration)) {
      duration = moment.duration(duration);
    }
    let timeString = '';
    const ref = [duration.hours(), duration.minutes(), duration.seconds()];
    for (let index = 0, i = 0, len = ref.length; i < len; index = ++i) {
      const value = ref[index];
      if (value > 0 || timeString !== '') {
        if (value < 10) {
          timeString += '0';
        }
        timeString += value;
        if (index < 2) {
          timeString += ':';
        }
      }
      if (index === 2 && timeString === '') {
        timeString = '00';
      }
    }
    return timeString;
  }

  humanize(duration) {
    if (!moment.isDuration(duration)) {
      duration = moment.duration(duration);
    }
    const units = ['ч.', 'мин.', 'сек.'];
    let timeString = '';
    const ref = [duration.hours(), duration.minutes(), duration.seconds()];
    for (let index = 0, i = 0, len = ref.length; i < len; index = ++i) {
      const value = ref[index];
      const unit = units.shift();
      if (value > 0 || timeString !== '') {
        timeString += value + ' ' + unit;
        if (index < 2) {
          timeString += ' ';
        }
      }
      if (index === 2 && timeString === '') {
        timeString = '00 ' + unit;
      }
    }
    return timeString;
  }

  getValue(run, beginning, meted) {
    let duration;
    if (run !== false) {
      duration = moment.duration(Date.now() - beginning);
    } else {
      duration = moment.duration();
    }
    duration.add(meted);
    return duration;
  }

  getStatus(run, meted, history) {
    let status;
    if (history.length === 0) {
      return 'new';
    }
    if (run === true) {
      status = 'running';
    } else if (meted === 0) {
      status = 'ready';
    } else {
      status = 'paused';
    }
    if (this.$.moreInfo.opened) {
      status += ' opened';
    }
    return status;
  }

  getGroupedHistory(e) {
    const history = e.base.slice(0);
    let start = 0;
    let end = 0;
    let gHistory = [
      {
        day: 'Сегодня',
        history: [],
      }, {
        day: 'Вчера',
        history: [],
      }, {
        day: 'Ранее',
        history: [],
      },
    ];
    for (let index = 0, i = 0, len = history.length; i < len; index = ++i) {
      const point = history[index];
      if (start === 0 && point[0] === 'bgn') {
        start = moment(point[1]);
        continue;
      }
      if (start !== 0 && end === 0 && point[0] === 'end') {
        end = moment(point[1]);
      }
      if (start !== 0 && end !== 0) {
        let group = 1;
        if (start.isSameOrAfter(moment().startOf('day'))) {
          group = 0;
        } else if (start.isBefore(moment().subtract(1, 'days').startOf('day'))) {
          group = 2;
        }
        const duration = end.diff(start);
        let row = start.format('HH:mm') + ' -> ' + end.format('HH:mm') + ' (' + this.humanize(duration) + ')';
        if (group > 1) {
          row = start.format('D MMM') + ' ' + start.format('HH:mm') + ' -> ' + end.format('D MMM') + ' ' + end.format('HH:mm') + ' (' + this.humanize(duration) + ')';
        }
        gHistory[group].history.unshift(row);
        start = end = 0;
      }
    }
    gHistory = gHistory.filter(function(item) {
      return item.history.length !== 0;
    });
    return gHistory;
  }

  timer() {
    if (this.run) {
      setTimeout(() => {
        this.timestamp = Date.now();
        this.dispatchEvent(new CustomEvent('bit',
            {bubbles: true, composed: true})
        );
        return this.timer();
      }, 300);
    }
  }

  moreInfo() {
    const moreInfo = this.$.moreInfo;
    moreInfo.toggle();
    return this.$.wrapper.toggleClass('opened', moreInfo.opened);
  }

  toggle() {
    const now = Date.now();
    if (!this.run) {
      if (this.beginning === false) {
        this.dispatchEvent(new CustomEvent('begin',
            {bubbles: true, composed: true})
        );
      }
      this.beginning = now;
      this.push('history', ['bgn', now]);
      this.run = true;
      this.timer();
    } else {
      this.run = false;
      this.meted += now - this.beginning;
      this.push('history', ['end', now]);
      this.dispatchEvent(new CustomEvent('end', {
        detail: {
          bgn: this.beginning,
          end: now,
        },
        bubbles: true,
        composed: true,
      }));
    }
    this.dispatchEvent(new CustomEvent('changed',
        {bubbles: true, composed: true})
    );
  }

  stop() {
    const now = Date.now();
    if (this.run) {
      this.dispatchEvent(new CustomEvent('end', {
        detail: {
          bgn: this.beginning,
          end: now,
        },
        bubbles: true,
        composed: true,
      }));
      this.push('history', ['end', now]);
      this.run = false;
    }
    this.meted = 0;
    this.splice('laps', 0, 9999);
    this.dispatchEvent(new CustomEvent('changed',
        {bubbles: true, composed: true})
    );
  }

  delete() {
    this.dispatchEvent(new CustomEvent('delete',
        {bubbles: true, composed: true})
    );
  }

  lap() {
    const info = {};
    info.value = this.meted;
    if (this.run !== false) {
      info.value += Date.now() - this.beginning;
    }
    if (this.laps.length === 0) {
      info.shift = 0;
    } else {
      info.shift = info.value - this.laps[0].value;
    }
    if (this.laps.length === 0 || info.value !== this.laps[0].value) {
      this.unshift('laps', info);
      TweenLite.from(this.$.laps, 0.5, {
        marginTop: '-24px',
        ease: Power2.easeOut,
      });
      this.dispatchEvent(new CustomEvent('changed',
          {bubbles: true, composed: true})
      );
    }
  }

  onNameChange() {
    this.dispatchEvent(new CustomEvent('changed',
        {bubbles: true, composed: true})
    );
  }

  asMinutes(duration) {
    const n = Math.round(duration.asMinutes());
    if (n < 1) {
      return '';
    }
    const forms = ['минута', 'минуты', 'минут'];
    return n + ' ' + forms[n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];
  }
}

customElements.define('stopwatch-counter', StopwatchCounter);
