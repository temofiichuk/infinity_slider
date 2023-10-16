function SliderX(selector, options) {
	this.className = "slider-x";
	this.main = document.querySelector(selector);
	this.track = document.createElement("div");
	this.children = [...this.main.children];
	this.defaultOptions = {
		autoplay: false,
		interval: 4000,
		infinity: false,
		buttons: false
	};
	this.options = { ...this.defaultOptions, ...options };
	this.slideWidth = () => this.children[0].offsetWidth;
	this.gapColumn = () =>
		parseInt(getComputedStyle(this.track).columnGap) || 0;
	this.viewSlide = Math.round(this.track.offsetWidth / this.slideWidth());
	this.intervalKey = null;
	this.isScrolling = false;
	this.startX = null;
	this.startScrollLeft = null;

	this.createStructure = () => {
		this.main.classList.add(this.className);
		this.track.classList.add(this.className + "_track");

		this.children.forEach(child => {
			child.classList.add(`${this.className}_slide`);
			child.setAttribute("draggable", false);
			this.track.appendChild(child);
		});
		this.main.appendChild(this.track);
		this.options.prevBtn = document.createElement("button");

		if (!this.options.buttons) {
			this.nextBtn = document.createElement("button");
			this.prevBtn = document.createElement("button");
			this.nextBtn.innerHTML = "<span>&#9658;</span>";
			this.prevBtn.innerHTML = "<span>&#9668;</span>";
		} else {
			this.nextBtn = this.options.nextBtn;
			this.prevBtn = this.options.prevBtn;
		}

		this.nextBtn.classList += " " + this.className + "_button arrow right ";
		this.prevBtn.classList += " " + this.className + "_button arrow left ";

		this.main.appendChild(this.prevBtn);
		this.main.appendChild(this.nextBtn);
	};

	this.createCopySlides = () => {
		this.children
			.slice(-this.viewSlide)
			.reverse()
			.forEach(slide => {
				this.track.insertAdjacentHTML("afterbegin", slide.outerHTML);
			});
	};

	this.infinityScroll = () => {
		// if infinity is false stop on the last slide
		if (
			!this.options.infinity &&
			this.track.scrollLeft + 1 >=
				this.track.scrollWidth - this.track.offsetWidth
		) {
			return;
		}
		// go from last to first
		if (this.track.scrollLeft === 0) {
			this.track.classList.add("non-smoothly");
			this.track.scrollLeft =
				this.track.scrollWidth -
				2 * this.track.offsetWidth -
				this.gapColumn();
			this.track.classList.remove("non-smoothly");
		}
		// go from first to last
		else if (
			this.track.scrollLeft + 1 >=
			this.track.scrollWidth - this.track.offsetWidth
		) {
			this.track.classList.add("non-smoothly");
			this.track.scrollLeft = this.track.offsetWidth;
			this.track.classList.remove("non-smoothly");
		}
	};

	this.scrollStart = e => {
		this.isScrolling = true;
		this.track.classList.add("scroll");
		this.startX = e.pageX;
		this.startScrollLeft = this.track.scrollLeft;
	};

	this.scrollSnap = e => {
		if (!this.isScrolling) return;
		this.track.scrollLeft = this.startScrollLeft - (e.pageX - this.startX);
	};

	this.scrollStop = () => {
		this.isScrolling = false;
		this.track.classList.remove("scroll");
	};

	this.autoScrolling = () => {
		this.intervalKey = setInterval(() => {
			this.track.scrollLeft += this.slideWidth() + this.gapColumn();
		}, this.options.interval);
	};

	this._init = () => {
		this.createStructure();

		this.prevBtn.addEventListener("click", () => {
			this.track.scrollLeft += -this.slideWidth() - this.gapColumn();
		});
		this.nextBtn.addEventListener("click", () => {
			this.track.scrollLeft += this.slideWidth() + this.gapColumn();
		});

		if (this.options.snapScroll) {
			this.track.addEventListener("mousedown", e => this.scrollStart(e));
			this.track.addEventListener("mousemove", e => this.scrollSnap(e));
			document.addEventListener("mouseup", e => this.scrollStop(e));
		}

		if (this.options.infinity) {
			this.createCopySlides();
			this.track.addEventListener("scroll", e => this.infinityScroll(e));
		}

		if (this.options.autoplay) {
			this.autoScrolling();
			this.main.addEventListener("mousemove", () =>
				clearInterval(this.intervalKey)
			);
			this.main.addEventListener("mouseleave", this.autoScrolling);
		}
	};
}
