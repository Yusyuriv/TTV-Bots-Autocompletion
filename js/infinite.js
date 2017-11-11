(function() {
  class InfiniteScroll {
    constructor(elem, data) {
      if(typeof elem === 'string')
        elem = document.querySelector(elem);
      this.elem = elem;
      this.data = data;

      this.listener = this.listener.bind(this);

      this.add();
      if(!this.data.length) {
        this.destroy();
      } else {
        this.elem.addEventListener('scroll', this.listener, {passive: true});
      }
    }
    listener(e) {
      if(
        e && e.currentTarget && this.data &&
        e.currentTarget.scrollHeight
        - e.currentTarget.scrollTop
        - e.currentTarget.offsetHeight <= 150
      ) {
        this.add();
        if(!this.data.length) {
          this.destroy();
        }
      }
    }
    add() {
      if(this.elem)
        this.elem.insertAdjacentHTML('beforeend', this.data.splice(0, 15).join(''));
    }
    destroy() {
      if(this.elem)
        this.elem.removeEventListener('scroll', this.listener);
      this.elem = this.data = null;
    }
  }
  window.InfiniteScroll = InfiniteScroll;
})();