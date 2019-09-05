(function () {
  var events = {};
  var canvas = document.querySelector('canvas');
  var canvasSize = { width: 240, height: 160 };
  var textPosition = { left: 'flex-start', center: 'center', right: 'flex-end' };

  function getEventLocation(element, event) {
    var bounds = element.getBoundingClientRect();
    var pos = { x: bounds.left, y: bounds.top };

    return {
      x: Math.round(event.pageX - pos.x),
      y: Math.round(event.pageY - pos.y)
    };
  }

  function pickColor(event) {
    var eventLocation = getEventLocation(canvas, event);
    var context = canvas.getContext('2d');
    return context.getImageData(eventLocation.x, eventLocation.y, 1, 1).data;
  }

var textManager = {
    init: function (root, events) {
      var self = this;
      this.root = document.querySelector('.text-tab');
      this.hexInput = root.querySelector('div.item-l input');
      this.rInput = root.querySelector('div.item-m input');
      this.gInput = root.querySelector('div.item-n input');
      this.bInput = root.querySelector('div.item-o input');
      this.alignmentOptions = root.querySelectorAll('#alignment div');
      this.previewBox = document.querySelector('#color-selected');
      this.previewSpan = this.previewBox.querySelector('span');

      this.textModel = {
        content: null,
        color: '#000000',
        fontFamily: 'Arial',
        fontSize: 72,
        textAlignment: 'left'
      };

  /*    events.baseApplied.subscribe(function (baseProduct) {
        if (baseProduct.categoryName === 'Color') return;

        var profileData = CHAM.config.profileData[baseProduct.name];
        self.showNoText(profileData);
        self.updateTextPannel(profileData);
      });
  */

      root.querySelector('textarea[name="text"]').addEventListener('keyup', function (e) {
        self.previewSpan.innerHTML = e.target.value;
        self.textModel.content = e.target.value;
      });

      root.querySelector('select[name="style"]').addEventListener('change', function (e) {
        self.previewSpan.style.fontFamily = e.target.value;
        self.textModel.fontFamily = e.target.value;
      });

      root.querySelector('select[name="size"]').addEventListener('change', function (e) {
        self.previewSpan.style.fontSize = (parseInt(e.target.value) * 0.2) + 'px';
        self.textModel.fontSize = parseInt(e.target.value);
      });

      root.querySelectorAll('#alignment div').forEach(function (elem) {
        elem.addEventListener('click', function (e) {
          var clicked = e.currentTarget;
          [].forEach.call(self.alignmentOptions, function (el) { el.classList.remove('active'); });
          clicked.classList.add('active');
          self.previewBox.style.justifyContent = textPosition[clicked.dataset.side];

          self.textModel.textAlignment = clicked.dataset.side;
        });
      });

      root.querySelectorAll('.colorButton').forEach(function (elem) {
        elem.addEventListener('click', function (e) {
          document.querySelectorAll('.colorSelector').forEach(function (selector) {
            if (selector.firstElementChild === e.target.parentNode) selector.classList.remove('active');
            else selector.classList.add('active');
          });
        });
      });

      root.querySelectorAll('#palette div.color').forEach(function (elem) {
        elem.addEventListener('click', function (e) {
          var color = e.target.style.backgroundColor;
          var rgb = color.replace(/[rgba\(\)\s]/g, '').split(',');
          self.updateColorInputs('hexRgb', rgb);
        });
      });

      document.querySelector('#apply-text').addEventListener('click', function () {
        var text = self.textModel.content != null ? self.textModel : null;
        //events.textApplied.emit(text);
      });

      canvas.addEventListener('click', function (e) {
        var values = pickColor(e);
        self.updateColorInputs('hexRgb', values);
      });

      this.hexInput.addEventListener('keyup', function (e) {
        var value = e.target.value;
        if (value.length === 6)
          self.updateColorInputs('rgb', e.target.value);
      });

      [this.rInput, this.bInput, this.gInput].forEach(function (elem) {
        elem.addEventListener('keyup', function (e) {
          var value = e.target.value;
          if (value.length <= 3 && Number(value) <= 255)
            self.updateColorInputs('hex', [self.rInput.value || 0, self.bInput.value || 0, self.gInput.value || 0]);
        });
      });

      return this.render(canvas);
    },
    getValues: function (root) {
      return {
        text: root.querySelector('textarea[name="text"]').value,
        style: root.querySelector('select[name="style"]').value,
        size: root.querySelector('select[name="size"]').value,
        alignment: root.querySelector('#alignment div.active').dataset.side,
        color: this.hexInput.value
      }
    },
    updateColorInputs: function (expression, value) {
      var self = this;
      var rgb = '';
      switch (expression) {
        case 'hexRgb': //fires on color click
          rgb = self.setRGB(value);
          self.setHex(value);
          break;
        case 'hex': //only fires when rgb updated
          rgb = self.setHex(value);
          break;
        case 'rgb': //only fires when hex updated
          var rgbVaules = self.convertHexToRGB(value);
          rgb = self.setRGB(rgbVaules);
      }

      self.previewSpan.style.color = rgb;
      self.textModel.color = rgb;
    },
    setRGB: function (values) {
      this.rInput.value = values[0];
      this.gInput.value = values[1];
      this.bInput.value = values[2];
      return 'rgb(' + values[0] + ',' + values[1] + ',' + values[2] + ')';
    },
    setHex: function (values) {
      var hex = this.convertRGBToHex(values);
      this.hexInput.value = hex;
      return 'rgb(' + values[0] + ',' + values[1] + ',' + values[2] + ')';
    },
    convertHexToRGB: function (value) {
      var r = parseInt(value.substring(0, 2), 16);
      var g = parseInt(value.substring(2, 4), 16);
      var b = parseInt(value.substring(4, 6), 16);
      return [r, g, b];
    },
    convertRGBToHex: function (values) {
      if (values[0] > 255 || values[1] > 255 || values[2] > 255)
        throw "Invalid color component";
      var hex = ((values[0] << 16) | (values[1] << 8) | values[2]).toString(16);
      return hex;
    },
    showNoText: function (data) {
      var holder = this.root.querySelector('.text-tab .holder');
      var noText = this.root.querySelector('#no-text');
      if (!data.text) {
        holder.style.visibility = 'hidden';
        noText.style.display = 'flex';
        noText.innerHTML = 'Text is not available for ' + data.name + ' profile.';
      } else {
        noText.style.display = 'none';
        holder.style.visibility = 'visible';
      }
    },
    updateTextPannel: function (data) {
      this.setSizes(data.maxFont);
    },
    setSizes: function (max) {
      var selectOptions = this.root.querySelectorAll('select[name="size"] option');
      selectOptions.forEach(function (size) {
        if (size.value > max) size.style.display = 'none';
        else size.style.display = 'block';
      });
    },
    render: function (root) {
      var context = canvas.getContext('2d');
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;

      //add left to right color fade
      var bgFade = context.createLinearGradient(0, 0, canvas.width, 0);
      bgFade.addColorStop(0.0, '#FF0000');
      bgFade.addColorStop(0.166, '#FFFF00');
      bgFade.addColorStop(0.333, '#00FF00');
      bgFade.addColorStop(0.499, '#00FFFF');
      bgFade.addColorStop(0.667, '#0000FF');
      bgFade.addColorStop(0.833, '#FF00FF');
      bgFade.addColorStop(1.0, '#FF0000');

      context.fillStyle = bgFade;
      context.fillRect(0, 0, canvas.width, canvas.height);
      //console.log('check here', context.getImageData(0, 0, canvas.width, canvas.height));

      //add white to black fade
      var bgFade2 = context.createLinearGradient(0, 0, 0, canvas.height);
      bgFade2.addColorStop(0.0, 'rgba(255,255,255)');
      bgFade2.addColorStop(0.4, 'rgba(255,255,255,0)');
      bgFade2.addColorStop(0.5, 'rgba(0,0,0,0)');
      bgFade2.addColorStop(1.0, '#000000');
      context.fillStyle = bgFade2;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  textManager.init(document.querySelector('div.inputs'));

})();
